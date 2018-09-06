import React from "react";

const PageNotFound = () => (
  <div
    style={{
      width: "100%",
      height: "100vh",
      background: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexFlow: "column"
    }}
  >
    <img
      style={{ position: "relative", top: "-80px" }}
      src="https://media.istockphoto.com/vectors/error-404-vector-id538038858"
    />
    <a
      style={{
        width: "100px",
        textAlign: "center",
        position: "absolute",
        bottom: "100px",
        padding: "10px",
        background: "#547898",
        color: "#fff"
      }}
      href="javascript:window.history.back(-1)"
    >
      VOLTAR
    </a>
  </div>
);

export default PageNotFound;
