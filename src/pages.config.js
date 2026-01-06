import AuctionDetail from './pages/AuctionDetail';
import Auctions from './pages/Auctions';
import CardDetail from './pages/CardDetail';
import Cards from './pages/Cards';
import Home from './pages/Home';
import Profile from './pages/Profile';
import HighlyActiveCards from './pages/HighlyActiveCards';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AuctionDetail": AuctionDetail,
    "Auctions": Auctions,
    "CardDetail": CardDetail,
    "Cards": Cards,
    "Home": Home,
    "Profile": Profile,
    "HighlyActiveCards": HighlyActiveCards,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};