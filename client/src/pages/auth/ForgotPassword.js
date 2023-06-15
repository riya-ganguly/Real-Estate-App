import { useState } from "react";
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function ForgotPassword() {

  //state
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  //hooks
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      //console.table([email, password]);
      setLoading(true);
      const {data} = await axios.post(`/forgot-password`, {email,});
      if(data?.error){
        toast.error(data.error);
        setLoading(false);
      } 
      else{
        toast.success('Please Check your Email for password reset link');
        setLoading(false);
        navigate('/');
      }
      console.log(data);
    }
    catch(err){
      console.log(err);
      toast.error("Something went wrong. Try again.");
    }
  }

    return (
      <div>
          <h1 className= "display-2 bg-primary text-light p-5">
            Forgot Password
          </h1>

          <div className="container align-items-center"> 
            <div className="row ">
              <div className="col-lg-4 offset-lg-4">
                <form onSubmit={handleSubmit}>
                  <input type="text"
                  placeholder="Enter your Email"
                  className="form-control mb-4"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  />
                  <button disabled={loading} className="btn btn-primary col-12 mb-4">
                    {loading ? "Waiting..." : "Submit"}
                  </button>
                </form>
                <Link className="text-danger" to="/login">
                    Back to Login
                </Link>
              </div>
            </div>
          </div>
      </div>
    );
  }