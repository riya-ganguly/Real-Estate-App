import { useState } from "react"
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import {GOOGLE_PLACES_KEY} from "../../config";
import CurrencyInput from "react-currency-input-field";
import ImageUpload from "./ImageUpload";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";

export default function AdForm({action, type}) {
  //context
  const [auth, setAuth] = useAuth(); 
  //state
  const [ad, setAd] = useState({
    photos: [],
    uploading: false,
    price: "",
    address: "",
    bedrooms: "",
    bathrooms: "",
    carparks: "",
    landsize: "",
    title: "",
    description: "",
    loading: false,
    type,
    action,
  });

  const Navigate = useNavigate();

  const handleClick = async () => {
    try{
      setAd({...ad, loading: true});
      const {data} = await axios.post("/ad", ad);
      console.log("Ad create response => ", data)
      if(data?.error){
        toast.error(data.error);
        setAd({...ad, loading: false});
      }      
      else{
        // data {user, ad}

        // update user in context
        setAuth({...auth, user: data.user})

        // update user in local storage
        const fromLS = JSON.parse(localStorage.getItem("auth"));
        fromLS.user = data.user;
        localStorage.setItem('auth', JSON.stringify(fromLS));

        toast.success("Ad created successfully");
        setAd({...ad, loading: false});
        // Navigate('/dashboard');

        //reload page on redirect
        window.location.href = '/dashboard'
      }
    }
    catch(err) {
      console.log(err);
      setAd({...ad, loading: false});
    }
  }
  
  return (
        <>
           <div className="mb-3 form-control">
             <ImageUpload ad={ad} setAd={setAd} />
             <GooglePlacesAutocomplete 
             apiKey = {GOOGLE_PLACES_KEY} 
             apiOptions="in" 
             selectProps={{
              defaultInputValue: ad?.address, 
              placeholder: "Search for Address", 
              onChange: ({value}) => {
                setAd({...ad, address: value.description});
              },
            }}
             />
           </div>
           
           <CurrencyInput 
             placeholder="Enter Price" 
             defaultValue={ad.price} 
             className="form-control mb-3"
             onValueChange={(value) => setAd({...ad, price: value})}
           />      

          {type === "House" ? (
            <>
            <input 
              type="number"
              min= "0" 
              className="form-control mb-3"
              placeholder="Enter how many bedrooms"
              value={ad.bedrooms}
              onChange={e=> setAd({...ad, bedrooms: e.target.value})}
            />

            <input 
              type="number"
              min= "0" 
              className="form-control mb-3"
              placeholder="Enter how many bathrooms"
              value={ad.bathrooms}
              onChange={e=> setAd({...ad, bathrooms: e.target.value})}
            />

            <input 
              type="number"
              min= "0" 
              className="form-control mb-3"
              placeholder="Enter how many carparks"
              value={ad.carparks}
              onChange={e=> setAd({...ad, carparks: e.target.value})}
            />
            </>
            ) : ("")}

            <input 
             type="text"
             min= "0" 
             className="form-control mb-3"
             placeholder="Enter size of Land"
             value={ad.landsize}
             onChange={e=> setAd({...ad, landsize: e.target.value})}
            />

            <input 
             type="text"
             min= "0" 
             className="form-control mb-3"
             placeholder="Enter title"
             value={ad.title}
             onChange={e=> setAd({...ad, title: e.target.value})}
            />

            <textarea   
             className="form-control mb-3"
             placeholder="Enter Description"
             value={ad.description}
             onChange={e=> setAd({...ad, description: e.target.value})}
            />

            <button onClick={handleClick} className= {`btn btn-primary mb-5 ${ad.loading? "disabled" : ""}`} 
            >
              {ad.loading ? "Saving..." : "Submit" }
            </button>
            
           {/* <pre>
            {JSON.stringify(ad, null, 4)}
           </pre> */}
        </>
  )
}
