import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@mui/material';
import axios from 'axios';
import { db, storage } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
// import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import * as google from '@google/generative-ai';


const CameraCapture = ({ onCapture }) => {

    const videoConstraints = {
        width: 1080,
        // height: "75%",
        facingMode: "user"
    };
    const webcamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);

    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
    };

    const sendToGemini = async () => {
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        const image = {
            inlineData: {
            data : capturedImage.split(',')[1],
            mimeType : "image/jpeg"
            },
        };
      
    //   const result = await model.generateContent([prompt, image]);
    //   console.log(result.response);


    const imageName = `pantry-items/${Date.now()}.jpg`;
    const storageRef = ref(storage, imageName);
    await uploadString(storageRef, capturedImage, 'data_url');
    const imageUrl = await getDownloadURL(storageRef);
    console.log(imageUrl);


    // const fileManager = new GoogleAIFileManager(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    // const uploadResult = await fileManager.uploadFile(capturedImage, {
    //     mimeType: "image/jpeg",
    //     // displayName: "Sample drawing",
    // });
    // console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`);
    // const getResult = await fileManager.getFile(uploadResult.file.name);
    // console.log(getResult)


    // const client = new google.Images({
    //     projectId: 'your-google-cloud-project-id',
    // });

    // // Send the image to the Gemini API
    // const [response] = await client.recognize({
    //     content: capturedImage.split(',')[1], // Get the base64 part of the image
    // });

    // console.log(response)

    // const itemName = response.name;
    // const itemQuantity = response.quantity || 1;


    try {
        const result = await model.generateContent([
            "Idententify the food items in the image file and return result in json formate with keys name, item description and quantity and their corresponding values without ```json in the begining",
            image,
          ]);
        console.log(result.response);
        console.log(result.response.text());

    //   const response = await axios.post('https://api.gemini.example.com/recognize', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   });
        const res = JSON.parse(result.response.text());
        console.log(res);
        console.log(res.name);

        const itemName = res.name;
        const itemQuantity = res.quantity || 1; // Assume quantity is 1 if not returned

        // Add the item to Firebase
        await addDoc(collection(db, 'pantry'), {
            name: itemName,
            quantity: itemQuantity,
            imageURL: imageUrl
        });

        onCapture();
        setCapturedImage(null);
    } catch (error) {
        console.error('Error sending image to Gemini API:', error);
    }
  };

  return (
    <div className="container" style={{justifyContent: 'center'}}>
      {!capturedImage ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          />
          <Button variant="contained" color="primary" onClick={captureImage}>
            Capture Image
          </Button>
        </>
      ) : (
        <div>
          <img src={capturedImage} alt="Captured" />
          <Button variant="contained" color="primary" onClick={sendToGemini}>
            Send to Gemini
          </Button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;