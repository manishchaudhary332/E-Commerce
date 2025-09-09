const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";

const AddProduct = () => {
  const [image, setImage] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: "",
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const Add_Product = async () => {
    try {
      let product = { ...productDetails };

      // 👉 Step 1: Upload Image to Cloudinary via backend
      if (image) {
        const formData = new FormData();
        formData.append("product", image);

        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (uploadData.success) {
          product.image = uploadData.image_url; // ✅ Cloudinary ka URL aa jayega
        } else {
          alert("Image upload failed");
          return;
        }
      }

      console.log("Final Product Data:", product);

      // 👉 Step 2: Save Product in DB
      const res = await fetch(`${API_URL}/addproduct`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Product Added Successfully!");
        setProductDetails({
          name: "",
          image: "",
          category: "women",
          new_price: "",
          old_price: "",
        });
        setImage(false);
      } else {
        alert("❌ Failed to add product");
      }
    } catch (error) {
      console.error("Add Product Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type here"
        />
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="text"
            name="old_price"
            placeholder="Type here"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name="new_price"
            placeholder="Type here"
          />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className="addproduct-thumnail-img"
            alt=""
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="img"
          id="file-input"
          hidden
        />
      </div>

      <button onClick={Add_Product} className="addproduct-btn">
        ADD
      </button>
    </div>
  );
};

export default AddProduct;
