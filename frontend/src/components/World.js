import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';

import City from './City';
import CountryInformation from './CountryInformation';

import {BASE_URL, LIMIT} from '../parameters/parameters';

import back from '../assets/back.svg';

const styles = theme => ({
  buttonTop:{
    width:10,
    position: 'fixed',
    top: '10px',
    left: '10px',
    zIndex: 1
  },
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
});

class World extends Component {

  constructor(props) {
    super(props);
      this.state = {
        screenName:'',
        page:0,
        result:[],
        selected:'',
        reachedEnd: false,
      };
      this.history = [{name:'continents'}] //keep track of user history
  }

  componentDidMount = () => {
    this.getContinents();
  }

  /*********************Fetch data from graphql server*********************/

  getContinents = async () => {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{ continents }`,
        }),
      });
    const results = await res.json();
    if (results["errors"] === undefined) {
      const data = JSON.parse(results['data']['continents'])
      this.setState({
        result:data,
        screenName:'continents',
        page:0
      })
    }
  }

  getRegions = async (continent, page) => {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{ regions(continent: "${continent}", limit: ${LIMIT}, offset: ${page === undefined ? 0 : page + 1}) }`,
        }),
      });
    const results = await res.json();
    if (results["errors"] === undefined) {
      const data = JSON.parse(results['data']['regions'])
      this.setState({
        result: page === undefined ? data : [...this.state.result, ...data],
        screenName:'regions',
        page: page === undefined ? 0 : page + 1,
        selected:continent,
        reachedEnd: data.length === 0 ? true : false
      })
    }
  }

  getCountries = async (region, page) => {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{ countries(region: "${region}", limit: ${LIMIT}, offset: ${page === undefined ? 0 : page + 1}) }`,
        }),
      });
    const results = await res.json();
    if (results["errors"] === undefined) {
      const data = JSON.parse(results['data']['countries'])
      this.setState({
        result: page === undefined ? data : [...this.state.result, ...data],
        screenName:'countries',
        page: page === undefined ? 0 : page + 1,
        selected:region,
        reachedEnd: data.length === 0 ? true : false
      })
    }
  }

  getCities = async (code, page) => {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{ cities(code: "${code}", limit: ${LIMIT}, offset: ${page === undefined ? 0 : page + 1}) }`,
        }),
      });
    const results = await res.json();
    if (results["errors"] === undefined) {
      const data = JSON.parse(results['data']['cities'])
      this.setState({
        result: page === undefined ? data : [...this.state.result, ...data],
        screenName:'cities',
        page: page === undefined ? 0 : page + 1,
        selected:code,
        reachedEnd: data.length === 0 ? true : false
      })
    }
  }

  /********************************************************************/

  // Move into the world directory ie continent->region->country->cities
  onClick = (data) => {
    switch(this.state.screenName) {
      case "continents":
        this.history.push({
          name:"regions",
          region:data["name"]
        });
        this.getRegions(data["name"]);
        break;
      case "regions":
        this.history.push({
          name:"countries",
          country:data["name"]
        });
        this.getCountries(data["name"]);
        break;
      case "countries":
        this.history.push({
          name:"cities",
          city:data["name"]
        });
        this.getCities(data["code"]);
        break;
    }
  }

  //Pagination of results
  onClickViewMore = () => {
    switch(this.state.screenName) {
      case "regions":
        this.getRegions(this.state.selected,this.state.page);
        break;
      case "countries":
        this.getCountries(this.state.selected,this.state.page);
        break;
      case "cities":
        this.getCities(this.state.selected,this.state.page);
        break;
    }
  }

  // Go back to previous directory
  onClickBack = () => {
    this.history.pop();
    // console.log(this.history);
    const length = this.history.length;
    switch(this.history[length - 1]["name"]) {
      case "continents":
        this.getContinents();
        break;
      case "regions":
        this.getRegions(this.history[length - 1]["region"]);
        break;
      case "countries":
        this.getCountries(this.history[length - 1]["country"]);
        break;
    }
  }

  //Display page/section
  getScreenName = () => {
    let screenName = {...this.history[this.history.length - 1]};
    delete screenName["name"];
    let result = 'World'
    switch(Object.keys(screenName)[0]) {
      case "region":
        result = screenName["region"];
        break;
      case "country":
        result = screenName["country"];
        break;
      case "city":
        result = screenName["city"];
        break;
    }
    return result;
  }

  // Display results as list
  renderResults = () => {
    let results = this.state.result;
    if (results.length === 0) {
      return (
        <Typography variant="h6" gutterBottom>
            No results
        </Typography >
      )
    } else {
      let i = 0;
      let list = results.map((data,index) => {
          i = index;
          return (
              <div>
                {
                  this.state.screenName !== 'cities' ?
                  <ListItem key={index}
                    button
                    onClick = {()=>{this.onClick(data)}}
                  >
                    {data["name"]}
                  </ListItem>
                  :
                  <City
                    data = {data}
                    getCities = {this.getCities}
                    index = {index}
                  />
                }

              </div>
          )
      })

      if (list.length % LIMIT === 0 && !this.state.reachedEnd){
        list.push(
          <ListItem key={i + 1}
            button
            onClick = {()=>{this.onClickViewMore()}}
          >
          View More
          </ListItem>
        )
      }
      return list;
    }
  }

  render() {
    const {classes} = this.props;
    return (
      <div>
        <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
          <Typography variant="h6" gutterBottom>
              {this.getScreenName()}
          </Typography >
        </Box>
        {
          this.history.length !== 1?
          <Button className = {classes.buttonTop} variant="contained" onClick = {()=>{this.onClickBack()}}>
            <img src={back} alt="back" width="20px" height="20px"/>
          </Button>
          :
          null
        }
        {
          this.state.screenName === 'cities' ?
          <div>
            <City
              data = {this.state.selected}
              getCities = {this.getCities}
            />
            <CountryInformation
              code = {this.state.selected}
            />
          </div>
          :
          null
        }
        {
          this.state.results !== [] ?
          <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ minHeight: '10vh' }}
            >
          <List component="nav"  className ={classes.root}>
            {this.renderResults()}
          </List>
          </Grid>
          :
          null
        }
      </div>
    )
  }
}

World.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(World);
