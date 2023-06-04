import * as React from "react";
import PropTypes from "prop-types";

export default class Header extends React.Component {
  render() {
    const { title, logo, message } = this.props;

    return (
      <section
        className="ms-welcome__header ms-bgColor-neutralLighter ms-u-fadeIn500"
        style={{ backgroundColor: "transparent" }}
      >
        <img
          width="30%"
          height="40%"
          src={logo}
          alt={title}
          title={title}
          style={{
            userSelect: "none",
            // border: "4px solid red",
            borderRadius: "50%",
            boxShadow: "0px 0px 10px 10px red",
          }}
        />
        <h1
          className="ms-fontSize-su ms-fontWeight-light ms-fontColor-neutralPrimary"
          style={{ userSelect: "none", fontFamily: "Times New Roman, serif", margin: "3% auto", color: "white" }}
        >
          {message}
        </h1>
        <h2
          className="ms-fontSize-l ms-fontWeight-light ms-fontColor-neutralPrimary"
          style={{
            userSelect: "none",
            fontFamily: "Times New Roman, serif",
            margin: "auto",
            textAlign: "center",
            color: "white",
          }}
        >
          Highlight text and modify it!
        </h2>
      </section>
    );
  }
}

Header.propTypes = {
  title: PropTypes.string,
  logo: PropTypes.string,
  message: PropTypes.string,
};
