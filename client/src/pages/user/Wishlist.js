import axios from "axios";
import Sidebar from "../../components/nav/Sidebar";
import {useAuth} from "../../context/auth";
import { useState, useEffect } from "react";
import AdCard from "../../components/cards/AdCard";

export default function Wishlist() {

  //context
  const [auth, setAuth] = useAuth();

   //state
   const [ads, setAds] = useState();
   const [loading, setLoading] = useState(false);

   //hooks
   useEffect(() => {
    fetchAds();
   }, [auth.token !== ''])

   const fetchAds = async () => {
    try{
      const {data} = await axios.get(`/wishlist`);
      // setAds(data.ads);
      setAds(data);
    }
    catch(err){
      console.log(err);
    }
   }

  //  const loadMore = async () => {
  //   try{
  //     setLoading(true);
  //     const {data} = await axios.get(`/user-ads/${page}`);
  //     setAds([...ads, ...data.ads]);
  //     setTotal(data.total);
  //     setLoading(false);
  //   }catch(err){
  //     console.log(err);
  //     setLoading(false);
  //   }
  // }

  return (
    <div>
        <h1 className= "display-1 bg-primary text-light p-5">
          Wishlist
        </h1>
        <Sidebar/>

        {!ads?.length ? (
          <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={{marginTop: "-10%"}}      
          >
            <h2>Hey {auth.user?.name ? auth.user?.name : auth.user.username}, You have not liked any properties yet! </h2>
          </div>
        ) : (
          <div className="container">
            <div className="row">
              <div className="col-lg-8 offset-lg-2 mt-4 mb-4">
                <p className="text-center">You have liked {ads?.length} properties </p>
              </div>
            </div>
            <div className="row">
               {ads?.map((ad) => (
                <AdCard ad = {ad} key={ad._id} />
               ))}       
            </div>    
          </div>
        ) }
        
    </div>
  );
}
