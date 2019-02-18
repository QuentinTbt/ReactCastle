import React, { Component } from "react";
import json from "./json/newList.json";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

class Accueil extends Component {
  state = { json: json, searched: json , sort: ""};

  handleChange = event => {
    var castles = [];
    var search = event.target.value;
    this.state.json.forEach(hotel => {
      if (
        String(hotel.name)
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        castles.push(hotel);
      } else if (
        String(hotel.postalCode)
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        castles.push(hotel);
      }
      this.setState({ searched: castles });
    });
  };

  handleSelect = event => {
    
  }

  render() {
    return (
      <div className="m-2">
        <h2 className="text-center">Chateaux avec Restaurants étoilés</h2>
        <InputGroup>
          <InputGroup.Prepend>
            <DropdownButton
              title="Sort By"
              id="sort-addon"
              value={this.state.sortValue}
              onSelect={this.handleSelect}
            >
              <Dropdown.Item href="#stars">Sort by Stars</Dropdown.Item>
              <Dropdown.Item href="#prices">Sort by Hotel Price</Dropdown.Item>
              <Dropdown.Item href="#distance">
                Sort by Distance
              </Dropdown.Item>{" "}
              <Dropdown.Divider />
              <Dropdown.Item href="#clearSort">No Sort</Dropdown.Item>
            </DropdownButton>
          </InputGroup.Prepend>
          <FormControl placeholder="Research" onChange={this.handleChange} />
          <Button>Search</Button>
        </InputGroup>
        <Table className="m-2" striped bordered hover>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Lieu CP</th>
              <th>Prix</th>
              <th>Lien</th>
            </tr>
          </thead>
          <tbody>
            {this.state.searched.map(hotel => (
              <tr>
                <td>{hotel.name}</td>
                <td>{hotel.postalCode}</td>
                <td>{hotel.price !== "undefined" && hotel.price}</td>
                <td>
                  <Button onClick={() => window.open(hotel.linkToCastle, "_blank")}>
                    Lien
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default Accueil;