import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import Modal from '@material-ui/core/Modal';
import info from '../assets/info.svg';
import {BASE_URL} from '../parameters/parameters';

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: 200,
    height: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    overflow:'scroll',
  },
  buttonTop:{
    margin: theme.spacing.unit,
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: 1
  },
  table: {
    maxWidth: 200,
  },
  font: {
    fontSize: 10,
  },
  heading:{
    alignItems: 'center'
  }
});

class CountryInformation extends Component {
  constructor(props) {
    super(props);
      this.state = {
        modalOpen: false,
        data: {}
      };
  }

  getCountryInfo = async () => {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{ countryInfo(code: "${this.props.code}") }`,
        }),
      });
    const results = await res.json();
    const data = JSON.parse(results['data']['countryInfo'])
    if (results["errors"] === undefined) {
      this.setState({
        data: data
      })
    }    
  }

  handleModal = () => {
    this.setState({
      modalOpen: !this.state.modalOpen
    },() => {
      if(this.state.modalOpen) {
        this.getCountryInfo();
      }
    })
  };

  render() {
    const {classes} = this.props;
    return (
      <div>
        <Button className = {classes.buttonTop} variant="contained" onClick = {this.handleModal}>
          <img src={info} alt="info" width="20px" height="20px"/>
        </Button>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.modalOpen}
          onClose={this.handleModal}
        >
          <div className={classes.paper}>
            {
              this.state.data.country !== undefined ?
              <div className = {classes.font}>
                <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
                  <Typography variant="h5" gutterBottom>
                    {this.state.data.country}
                  </Typography>
                </Box>
                {
                  this.state.data.capital !== null?
                  <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
                    <Typography >
                        Capital :
                    </Typography>
                    <Typography >
                        {this.state.data.capital}
                    </Typography >
                  </Box>
                  :
                  null
                }
                {
                  this.state.data.surfacearea !== null?
                  <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
                    <Typography >
                        Surface Area :
                    </Typography>
                    <Typography >
                        {this.state.data.surfacearea +' sq m'}
                    </Typography >
                  </Box>
                  :
                  null
                }

                {
                  this.state.data.population !== null?
                  <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
                    <Typography >
                        Population :
                    </Typography >
                    <Typography >
                        {this.state.data.population}
                    </Typography >
                  </Box>
                  :
                  null
                }

                {
                  this.state.data.governmentform !== null?
                  <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
                    <Typography >
                        Government type :
                    </Typography >

                        <Typography>
                        {this.state.data.governmentform}
                        </Typography>

                  </Box>
                  :
                  null
                }

                {
                  this.state.data.headofstate !== null?
                  <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
                    <Typography >
                        Head of state :
                    </Typography >
                    <Typography >
                        {this.state.data.headofstate}
                    </Typography >
                  </Box>
                  :
                  null
                }

                {
                  this.state.data.gnp !== null?
                  <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
                    <Typography >
                        Gross national product:
                    </Typography >
                    <Typography >
                        {this.state.data.gnp + ' $'}
                    </Typography >
                  </Box>
                  :
                  null
                }
                {
                  this.state.data.language.length !== 0 ?
                  <TableContainer>
                    <Table  size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell className = {classes.font}>Language</TableCell>
                          <TableCell className = {classes.font} align="center">Percetage</TableCell>
                          <TableCell className = {classes.font} align="center">Official Language</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.data.language.map((row,index) => (
                          <TableRow key={index}>
                            <TableCell className = {classes.font} component="th" scope="row">
                              {row.language}
                            </TableCell>
                            <TableCell className = {classes.font} align="center">{row.percentage}</TableCell>
                            <TableCell className = {classes.font} align="center" >{row.is_official ? "yes" : "no"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  :
                  null

                }

              </div>
              :
              null
            }
          </div>
        </Modal>
      </div>
    );
  }

}

CountryInformation.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CountryInformation);
