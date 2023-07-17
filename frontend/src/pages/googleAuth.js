import React from "react";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

const GoogleAuth = () => {
  return (
    <div className="main-container">
      <GoogleOAuthProvider clientId="327729156972-u385vbit4lou36stv5f595ljhsdm1tpc.apps.googleusercontent.com">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const details = jwt_decode(credentialResponse.credential);
            console.log(details);
            // console.log(credentialResponse);
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleAuth;
