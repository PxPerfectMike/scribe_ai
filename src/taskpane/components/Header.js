import * as React from "react";
import PropTypes from "prop-types";

export default class Header extends React.Component {
  render() {
    const { title, logo, message } = this.props;

    return (
      <section className="ms-welcome__header ms-bgColor-neutralLighter ms-u-fadeIn500">
        <img width="90" height="90" src={logo} alt={title} title={title} style={{ userSelect: "none" }} />
        <h1
          className="ms-fontSize-su ms-fontWeight-light ms-fontColor-neutralPrimary"
          style={{ userSelect: "none", fontFamily: "Times New Roman, serif" }}
        >
          {message}
        </h1>
        <h2
          className="ms-fontSize-l ms-fontWeight-light ms-fontColor-neutralPrimary"
          style={{ userSelect: "none", fontFamily: "Times New Roman, serif", margin: "auto", textAlign: "center" }}
        >
          Highlight text and click a button to modify it!
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
