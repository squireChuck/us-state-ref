var StateInfoRow = React.createClass({
  render: function() {
    return (
      <tr>
        <td>{this.props.label}</td>
        <td>{this.props.children}</td>
      </tr>
    );
  }
});

var StateTable = React.createClass({
  render: function() {
    var stateRows = [];

    // Display info that hasn't been hidden by the user.
    if (this.props.hideOtherInfo !== true) {
      stateRows.push(<StateInfoRow label="Capital">{this.props.capital}</StateInfoRow>); 
    }

    if (this.props.hideLicenseInfo !== true) {
      stateRows.push(
        <StateInfoRow label="Driver's License Format">{this.props.driversLicenseDescription}</StateInfoRow>,
        <StateInfoRow label="Sample License">{this.props.sampleLicense}</StateInfoRow>);
    }

    this.props.addresses.forEach(function(address) {
      if (this.props.hideAddressInfo === true) {
        return;
      } else {
          stateRows.push(<StateInfoRow label="Sample Addresses">{address.street}<br />{address.city}, {address.state} {address.zip}</StateInfoRow>);
      }
    }.bind(this));

    var headerStyle = {
      borderBottom: '1px solid black'
    };
    return (
      <table>
        <thead>
          <tr>
            <th style={headerStyle} colspan="2">{this.props.name} - {this.props.abbrev}</th>
          </tr>
        </thead>
        <tbody>               
          {stateRows}  
        </tbody>
      </table>
    );
  }
});

var StateTables = React.createClass({
  render: function() {
    var stateTables = this.props.states.map(function(state) {
      if (state.name.toLowerCase().indexOf(this.props.filterText.toLowerCase()) === -1 && 
          state.abbrev.toLowerCase().indexOf(this.props.filterText.toLowerCase()) === -1) {
        return;
      }

      return (
        <StateTable name={state.name} abbrev={state.abbrev} capital={state.capital} 
                    addresses={state.addresses} driversLicenseDescription={state.driversLicenseDescription} 
                    sampleLicense={state.sampleLicense}
                    hideAddressInfo={this.props.hideAddressInfo} 
                    hideLicenseInfo={this.props.hideLicenseInfo}
                    hideOtherInfo={this.props.hideOtherInfo} >
        </StateTable>
      );
    }.bind(this));

    return (
      <div className="stateTables">
        {stateTables}
      </div>
    );
  }
});

var SearchBar = React.createClass({
  handleChange: function() {
    this.props.onUserInput(
      this.refs.filterTextInput.value,
      this.refs.hideAddressInfo.checked,
      this.refs.hideLicenseInfo.checked,
      this.refs.hideOtherInfo.checked
    );
  },  
  render: function() {
    return (
      <form>
        <input type="text" 
                placeholder="Search..." 
                value={this.props.filterText} 
                ref="filterTextInput"
                onChange={this.handleChange}/>
        <p>
        <input type="checkbox" 
                checked={this.props.hideAddressInfo} 
                ref="hideAddressInfo"
                onChange={this.handleChange}
                />
        {' '}
        Hide address info
        </p>
        <p>
        <input type="checkbox" 
                checked={this.props.hideLicenseInfo} 
                ref="hideLicenseInfo"
                onChange={this.handleChange}
                />
        {' '}
        Hide license info
        </p>
        <p>
        <input type="checkbox" 
                checked={this.props.hideOtherInfo} 
                ref="hideOtherInfo"
                onChange={this.handleChange}
                />
        {' '}
        Hide other info
        </p>
      </form>
    );
  }
});

var FilterableStateTables = React.createClass({
  getInitialState: function() {
    return {
      data: [], 
      filterText: '',
      hideAddressInfo: false,
      hideLicenseInfo: false,
      hideOtherInfo: false
    };
  },
  handleUserInput: function(filterText, hideAddressInfo, hideLicenseInfo, hideOtherInfo) {
    this.setState({
      filterText: filterText,
      hideAddressInfo: hideAddressInfo,
      hideLicenseInfo: hideLicenseInfo,
      hideOtherInfo: hideOtherInfo
    })
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div>
        <SearchBar 
          filterText={this.state.filterText}
          hideAddressInfo={this.state.hideAddressInfo}
          hideLicenseInfo={this.state.hideLicenseInfo}
          hideOtherInfo={this.state.hideOtherInfo}
          onUserInput={this.handleUserInput}
        />
        <StateTables 
          states={this.state.data} 
          filterText={this.state.filterText}
          hideAddressInfo={this.state.hideAddressInfo}
          hideLicenseInfo={this.state.hideLicenseInfo}
          hideOtherInfo={this.state.hideOtherInfo}
        />
      </div>
    );
  }
});

ReactDOM.render(
  <FilterableStateTables url="/app/api/v1/states" />,
  document.getElementById('container')
);