import { useSearch } from "../../context/search"
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { GOOGLE_PLACES_KEY } from "../../config";
import {sellPrices, rentPrices} from '../../helpers/priceList';
import queryString from "query-string";
import {useNavigate} from "react-router-dom";
import axios from "axios";

export default function SearchForm() {

    //context
    const [search, setSearch] = useSearch();

    //hook
    const navigate = useNavigate();

    const handleSearch = async () => {
      setSearch({...search, loading: true});
      try {
        const {result, page, price, ...rest} = search;
        const query = queryString.stringify(rest);
        // console.log(query);

        const {data} = await axios.get(`/search?${query}` )

        if(search?.page != "/search"){
          setSearch((prev) => ({
            ...prev,
            results: data,
            loading: false,
          }))
          navigate('/search');
        } else {
          setSearch((prev) => ({
            ...prev,
            results: data,
            page: window.location.pathname,
            loading: false,
          }))
        }
        
      } catch (err) {
        console.log(err);
        setSearch({...search, loading: false})
      }
    }

  return (
    <>
    <div className="container mt-3 mb-3">
        <div className="row">
            <div className="col-lg-12 form-control">
                <GooglePlacesAutocomplete 
                apiKey = {GOOGLE_PLACES_KEY} 
                apiOptions="in" 
                selectProps={{
                defaultInputValue: search?.address, 
                placeholder: "Search for Address", 
                onChange: ({value}) => {
                    setSearch({...search, address: value.description});
                },
                }}
                />
           </div>
        </div>

        <div className="d-flex justify-content-center mt-3">
            <button 
                onClick={({value}) => setSearch({...search, action: "Buy", price: ""})}
                className="btn btn-primary col-lg-2 square"
            > 
                {search.action === "Buy" ? "✔️ Buy" : "Buy" }
            </button>
            <button 
                onClick={({value}) => setSearch({...search, action: "Rent", price: ""})}
                className="btn btn-primary col-lg-2 square"
            >  
                {search.action === "Rent" ? "✔️ Rent" : "Rent" }
            </button>
            <button 
                onClick={({value}) => setSearch({...search, type: "House", price: ""})}
                className="btn btn-primary col-lg-2 square"
            >  
                {search.type === "House" ? "✔️ House" : "House" }
            </button>
            <button 
                onClick={({value}) => setSearch({...search, type: "Land", price: ""})}
                className="btn btn-primary col-lg-2 square"
            > 
                {search.type === "Land" ? "✔️ Land" : "Land" }
            </button>

            <div className="dropdown">
            <button
              className="btn btn-primary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              &nbsp; {search?.price ? search?.price : "Price"}
            </button>
            <ul className="dropdown-menu">
              {search.action === "Buy" ? (
                <>
                  {sellPrices.map((p) => (
                    <li key={p._id}>
                      <a
                        className="dropdown-item"
                        onClick={() =>
                          setSearch({
                            ...search,
                            price: p.name,
                            priceRange: p.array,
                          })
                        }
                      >
                        {p.name}
                      </a>
                    </li>
                  ))}
                </>
              ) : (
                <>
                  {rentPrices.map((p) => (
                    <li key={p._id}>
                      <a
                        className="dropdown-item"
                        onClick={() =>
                          setSearch({
                            ...search,
                            price: p.name,
                            priceRange: p.array,
                          })
                        }
                      >
                        {p.name}
                      </a>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
            <button 
              className="btn btn-danger col-lg-2 square"
              onClick={handleSearch}
            > 
              Search 
            </button>
         </div>
         {/* <pre>{JSON.stringify(search, null, 4)}</pre> */}
    </div>
    </>
  );
}


