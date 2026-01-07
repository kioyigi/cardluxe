#!/usr/bin/env python3
"""
Daily TCGdex Cardmarket avg1 dump (EN cards) with EUR->USD conversion.

Output:
  tcgdex_en_avg1_daily.csv

Filter (ONLY ONE):
  - Skip cards where avg1_usd < 1.00

Resilience:
  - Retries transient HTTP errors (429, 500, 502, 503, 504) with exponential backoff.

Timestamp:
  - Uses timezone-aware UTC timestamps (no deprecated utcnow()).
"""

import csv
import datetime
import io
import json
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

TCGDEX_BASE = "https://api.tcgdex.net/v2/en"
OUT = "tcgdex_en_avg1_daily.csv"

MIN_USD = 1.0  # ONLY FILTER: skip if avg1_usd < 1.00


def _fetch(url: str, timeout: int = 90, tries: int = 8, base_sleep: float = 1.0) -> bytes:
    """
    Fetch bytes from URL with retry/backoff on transient failures.
    Retries: 429, 500, 502, 503, 504 + URLError/TimeoutError.
    """
    last_err = None
    for i in range(tries):
        try:
            req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urlopen(req, timeout=timeout) as r:
                return r.read()
        except HTTPError as e:
            if e.code in (429, 500, 502, 503, 504):
                last_err = e
            else:
                raise
        except (URLError, TimeoutError) as e:
            last_err = e

        # Exponential backoff (capped)
        sleep_s = min(30.0, base_sleep * (2**i))
        time.sleep(sleep_s)

    raise RuntimeError(f"Failed after {tries} tries: {url} ({last_err})")


def get_json(url: str):
    return json.loads(_fetch(url).decode("utf-8"))


def get_text(url: str):
    return _fetch(url).decode("utf-8", errors="replace")


def eur_to_usd_rate_from_ecb() -> float:
    """
    Pull latest EUR->USD reference exchange rate from ECB (CSV).
    Series: EXR/D.USD.EUR.SP00.A (USD per 1 EUR).
    """
    url = "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?lastNObservations=1&format=csvdata"
    txt = get_text(url)
    reader = csv.DictReader(io.StringIO(txt))
    for row in reader:
        v = row.get("OBS_VALUE") or row.get("obs_value") or row.get("value")
        if v:
            return float(v)
    raise RuntimeError("Could not parse EUR→USD rate from ECB CSV")


def main():
    rate = eur_to_usd_rate_from_ecb()

    # Timezone-aware UTC timestamp (fixes utcnow() deprecation warning)
    run_ts = datetime.datetime.now(datetime.timezone.utc).isoformat()

    with open(OUT, "w", encoding="utf-8") as f:
        # CSV header
        f.write("tcgdex_id,name,number,avg1_eur,avg1_usd,updated,run_timestamp,eurusd_rate\n")

        page = 1
        per_page = 250
        kept = 0

        while True:
            briefs = get_json(f"{TCGDEX_BASE}/cards?pagination:page={page}&pagination:itemsPerPage={per_page}")
            if not briefs:
                break

            for b in briefs:
                cid = b.get("id")
                if not cid:
                    continue

                try:
                    card = get_json(f"{TCGDEX_BASE}/cards/{cid}")
                except Exception:
                    # If a single card fetch fails, skip it; retry logic is already inside get_json/_fetch
                    continue

                pricing = (card.get("pricing") or {}).get("cardmarket") or {}
                avg1 = pricing.get("avg1")
                if avg1 is None:
                    continue

                # Convert and apply the ONLY filter you requested
                avg1_usd = float(avg1) * rate
                if avg1_usd < MIN_USD:
                    continue

                name = (card.get("name") or "").replace('"', '""').strip()
                local = str(card.get("localId") or "").strip()
                cc = ((card.get("set") or {}).get("cardCount") or {})
                denom = cc.get("official") or cc.get("total") or ""
                number = f"{local}/{denom}" if (local and denom) else local
                updated = pricing.get("updated") or ""

                # Write row
                f.write(
                    f'{cid},"{name}",{number},{avg1},{avg1_usd:.2f},{updated},{run_ts},{rate}\n'
                )
                kept += 1

                # Gentle pacing to be polite to the API
                time.sleep(0.01)

            page += 1
            time.sleep(0.05)

    print(f"Wrote {OUT} with {kept} cards (avg1_usd >= ${MIN_USD:.2f}). EURUSD={rate} | run={run_ts}")


if __name__ == "__main__":
    main()
