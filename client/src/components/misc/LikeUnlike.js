import { useNavigate } from "react-router-dom";
import {useAuth} from "../../context/auth";
import {FcLike, FcLikePlaceholder} from "react-icons/fc"; 
import axios from "axios";
import toast from "react-hot-toast";

export default function LikeUnlike({ad}) {

    //context
    const [auth, setAuth] = useAuth();
    //hooks
    const Navigate = useNavigate();

    const handleLike = async () => {
      try{
        if(auth.user === null) {
            Navigate('/login', {
                state: `/ad/${ad.slug}`,
            });
            return;
        }
        const {data} = await axios.post('/wishlist', {adId: ad._id});
        setAuth({...auth, user: data});
        const fromLS = JSON.parse(localStorage.getItem("auth"));
        fromLS.user = data;
        localStorage.setItem("auth", JSON.stringify(fromLS));
        toast.success("Added to Wishlist");
      }  
      catch(err){
        console.log(err);
      }
    }

    const handleUnlike = async () => {
        try{
            if(auth.user === null) {
                Navigate('/login', {
                    state: `/ad/${ad.slug}`,
                });
                return;
            }
            const {data} = await axios.delete( `/wishlist/${ad._id}`);
            setAuth({...auth, user: data});
            const fromLS = JSON.parse(localStorage.getItem("auth"));
            fromLS.user = data;
            localStorage.setItem("auth", JSON.stringify(fromLS));
            toast.success("Removed from Wishlist");
          }   
        catch(err){
          console.log(err);
        }
      }

  return (
    <>
        {auth.user?.wishlist?.includes(ad?._id) ? (
            <span>
                <FcLike onClick={handleUnlike} className="h2 mt-3 pointer"/>
            </span>
        ) : (
            <span>
                <FcLikePlaceholder onClick={handleLike} className="h2 mt-3 pointer" />
            </span>
        )}
    </>
  )
}
