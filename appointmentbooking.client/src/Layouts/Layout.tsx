import Header from "../Components/Header/Header";
import NoSearchHeader from "../Components/Header/NoSearchHeader";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  searchBar: boolean;
}

const Layout = ({ searchBar }: LayoutProps) => {
  return (
    <>
      {searchBar ? <Header /> : <NoSearchHeader />}
      <Outlet />
    </>
  );
};

export default Layout;
