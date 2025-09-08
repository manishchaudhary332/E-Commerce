const API_URL = import.meta.env.VITE_API_URL;
import { useEffect } from "react";
import { createContext, useState } from "react";


export const ShopContext  = createContext(null)

const getDefaultCart =()=>{
        let Cart={};
        for(let index = 0; index< 300+1; index++){
            Cart[index] = 0;
        }
        return Cart
    }

const ShopContextProvider = (props)=>{
    const [all_product,setAll_product] = useState([])
    const [cartItems,setcartItem] = useState(getDefaultCart())
    
    useEffect(()=>{
        fetch(`${API_URL}/allproducts`).then((response)=>response.json())
        .then((data)=>setAll_product(data))

        if(localStorage.getItem('auth-token')){
            fetch(`${API_URL}/getcart`,{
                method:"POST",
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:"",
            }).then((response)=>response.json())
              .then((data)=>setcartItem(data))
        }
    },[])

    const addToCart = (itemId)=>{
        setcartItem((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        if(localStorage.getItem('auth-token')){
            fetch(`${API_URL}/addtocart`,{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({"itemId":itemId})
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data));
            
        }
    }

    const removeFromCart = (itemId)=>{
        setcartItem((prev)=>({...prev,[itemId]:prev[itemId]-1}))
        if(localStorage.getItem('auth-token')){
                 fetch(`${API_URL}/removefromcart`,{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({"itemId":itemId})
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data));
            
        }
    }

    const getTotalCartAmount = ()=>{
        let totalAmount = 0;
        for(let item in cartItems){
            if(cartItems[item]>0){
                let itemInfo = all_product.find((product)=>product.id === Number(item))
                totalAmount += itemInfo.new_price * cartItems[item]
            }
        }
        return totalAmount
    }

    const getTotalCartItems  = ()=>{
        let totalItem = 0;
        for(let item in cartItems){
            if(cartItems[item]>0){
                totalItem+=cartItems[item]
            }
        }
        return totalItem
    }

     const contextValue = {getTotalCartItems,getTotalCartAmount,all_product,cartItems,addToCart,removeFromCart};
    return(
        <ShopContext.Provider value={contextValue}>
             {props.children}
        </ShopContext.Provider>
)
}

export default ShopContextProvider