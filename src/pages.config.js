import AuctionDetail from './pages/AuctionDetail';
import Auctions from './pages/Auctions';
import CardDetail from './pages/CardDetail';
import Cards from './pages/Cards';
import Home from './pages/Home';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AuctionDetail": AuctionDetail,
    "Auctions": Auctions,
    "CardDetail": CardDetail,
    "Cards": Cards,
    "Home": Home,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};