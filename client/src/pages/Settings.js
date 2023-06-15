import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Sidebar from "../components/nav/Sidebar";


export default function Settings() {


    //state
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        
        e.preventDefault();
        try {
            setLoading(true);
            const {data} = await axios.put('/update-password', {
                password, 
            });
            if(data?.error){
                toast.error(data.error);
                setLoading(false);
            }
            else{
                setLoading(false);
                toast.success("Password Updated");
            }
        } catch (err) {
            console.log(err); 
            setLoading(false);           
        }
    }

  return (
    <>
        <h1 className= "display-1 bg-primary text-light p-5">
          Settings
        </h1>
        <div className="container-fluid">
            <Sidebar />
            <div className="container mt-2">

                <div className="row">
                    <div className="col-lg-8 offset-lg-2 mt-2">
                                            
                        <form onSubmit={handleSubmit}>
                            
                            <input 
                                type="password" 
                                placeholder="Update your password" 
                                className="form-control mb-4" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)
                                } 
                            />
                            
                            <button 
                                className="btn btn-primary col mb-4" 
                                disabled={loading}
                            >
                                {loading ? "Processing" : "Update Password"}
                            </button>
                        </form>
                    </div>
                </div>                
            </div>
       </div>
    </>
  )
}


// //
// // fallback: {
// //     // 👇️👇️👇️ add this 👇️👇️👇️
// //     "fs": false,
// //     "os": false,
// //     "path": require.resolve("path-browserify"),
// //   },