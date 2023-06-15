import axios from "axios";
import Sidebar from "../../components/nav/Sidebar";
import {useAuth} from "../../context/auth";
import { useState, useEffect } from "react";
import UserAdCard from "../../components/cards/UserAdCard";

export default function Dashboard() {

  //context
  const [auth, setAuth] = useAuth();

  const seller = auth.user?.role?.includes("Seller");

   //state
   const [ads, setAds] = useState([]);
   const [total, setTotal] = useState(0);
   const [page, setPage] = useState(1);
   const [loading, setLoading] = useState(false);

   //hooks
   useEffect(() => {
    fetchAds();
   }, [auth.token !== ''])

   useEffect(()=> {
    if(page === 1) return;
    fetchAds();   
   }, [page])

   const fetchAds = async () => {
    try{
      const {data} = await axios.get(`/user-ads/${page}`);
      // setAds(data.ads);
      setAds([...ads, ...data.ads]);
      setTotal(data.total);
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
          Dashboard
        </h1>
        <Sidebar/>

        {!seller ? (
          <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={{marginTop: "-10%"}}      
          >
            <h2>Hey {auth.user?.name ? auth.user?.name : auth.user.username}, Welcome to Reaist App </h2>
          </div>
        ) : (
          <div className="container">
            <div className="row">
              <div className="col-lg-8 offset-lg-2 mt-4 mb-4">
                <p className="text-center">Total {total} ads found </p>
              </div>
            </div>
            <div className="row">
               {ads?.map((ad) => (
                <UserAdCard ad = {ad} key={ad._id} />
               ))}       
            </div>  

            {ads?.length < total ? (
              <div className="row">
                <div className="col text-center mt-4 mb-4">
                <button disabled={loading} className="btn btn-warning" onClick={(e) => {
                  e.preventDefault();
                  setPage(page+1);
                }}
                >
                  {loading ? "Loading" : `${ads.length} / ${total} Load more`}
                </button> 
                </div>            
              </div>
            ) : (
              ""
            )}    
          </div>
        ) }
        
    </div>
  );
}
