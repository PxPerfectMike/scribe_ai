import React from "react";
import PropTypes from "prop-types";
import Progress from "./Progress";
import ModificationForm from "./ModificationForm";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return <Progress message="Pretty please sideload your addin to see app body." />;
    }

    return (
      <div>
        {/* <Header message="Cindy AI" logo={logo} /> */}
        <ModificationForm />
      </div>
    );
  }
}

App.propTypes = {
  isOfficeInitialized: PropTypes.bool,
};

export default App;
