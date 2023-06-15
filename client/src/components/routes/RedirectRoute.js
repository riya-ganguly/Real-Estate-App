import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function RedirectRoute() {

    //state
    const [count, setCount] = useState(3);

    //hooks
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((currentCount) => --currentCount);
        }, 1000);
        //redirect
        count === 0 && navigate('/');
        //clean interval
        return () => clearInterval(interval);

    }, [count]);
  return (
    <div 
        className="d-flex justify-content-center align-items-center vh-100"
    >
        <h2>Please Login. Redirecting in {count} second. </h2>
    </div>
  )
}
