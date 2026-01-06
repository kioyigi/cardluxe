import Home from './pages/Home';
import Cards from './pages/Cards';
import CardDetail from './pages/CardDetail';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Cards": Cards,
    "CardDetail": CardDetail,
    "Auctions": Auctions,
    "AuctionDetail": AuctionDetail,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};