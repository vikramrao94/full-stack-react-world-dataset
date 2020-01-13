import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import Form from './Form';

import {BASE_URL} from '../parameters/parameters';

import add from '../assets/plus.svg';
import edit from '../assets/edit.svg';
import del from '../assets/delete.svg';

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
    transform: `translate(-50%, -50%)`
  },
  editButton: {
    width: '10vw',
    position: "absolute",
    bottom: 20,
  },
  deleteButton: {
    width: '10vw',
    position: "absolute",
    bottom: 80,
  },
  buttonDown:{
    margin: theme.spacing.unit,
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    zIndex: 1
  },
});

class City extends Component {
  constructor(props) {
    super(props);
      this.state = {
        modalOpen: false,
        edit: false
      };
  }

  /***********Persist changes in database*************************/
  updateCity = async (data) => {

    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation {
            editCity(id: ${data["id"]}, city: "${data["city"]}", district: "${data["district"]}", population: ${data["population"]}) {
              status
            }
          }`,
        }),
      });
    const results = await res.json();
    if (results["errors"] === undefined) {
      const status = results["data"]["editCity"]["status"];
      this.setState({
        modalOpen:false
      },() => {
        this.props.getCities(this.props.data["code"]);
        store.addNotification({
          title: `${data['city']} updated to database`,
          message: status === "ok"?'Success':'Fail',
          type: status === "ok"?'success':'warning',
          container: 'bottom-left',
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 3000
          }
        })
      })
    }
  }

  addCity = async (data) => {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation {
            addCity(code: "${data["code"]}", city: "${data["city"]}", district: "${data["district"]}", population: ${data["population"]}) {
              status
            }
          }`,
        }),
      });
    const results = await res.json();
    if (results["errors"] === undefined) {
      const status = results["data"]["addCity"]["status"];
      this.setState({
        modalOpen:false
      },() => {
        this.props.getCities(this.props.data);
        store.addNotification({
          title: `${data['city']} added to database`,
          message: status === "ok"?'Success':'Fail',
          type: status === "ok"?'success':'warning',
          container: 'bottom-left',
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 3000
          }
        })
      })
    }
  }

  deleteCity = async (data) => {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation {
            deleteCity(id: ${data["id"]}) {
              status
            }
          }`,
        }),
      });
    const results = await res.json();
    if (results["errors"] === undefined) {
      const status = results["data"]["deleteCity"]["status"];
      this.setState({
        modalOpen:false
      },() => {
        store.addNotification({
          title: `${data['name']} deleted from database`,
          message: status === "ok"?'Success':'Fail',
          type: status === "ok"?'success':'warning',
          container: 'bottom-left',
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 3000
          }
        })
        this.props.getCities(this.props.data["code"]);
      })
    }
  }

  /************************************************************/
  handleModal = () => {
    this.setState({
      modalOpen: !this.state.modalOpen,
      edit: false
    })
  };

  handleEdit = () => {
    this.setState({
      edit: !this.state.edit
    })
  };

  handleDelete = () => {
    this.deleteCity(this.props.data)
  }

  render() {
    const {classes} = this.props;
    return(
      <div>
        {
          typeof this.props.data!== "string" ?
          <ListItem
            button
            onClick = {this.handleModal}
            key={this.props.index}
          >
          {this.props.data["name"]}
          </ListItem>
          :
            <Button className = {classes.buttonDown} variant="contained" onClick = {this.handleModal}>
              <img src={add} alt="add" width="20px" height="20px"/>
            </Button>
        }

        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.modalOpen}
          onClose={this.handleModal}
        >
          <div className={classes.paper}>
            {
              this.state.edit || typeof this.props.data === "string" ?
              <Form
                data = {this.props.data !== undefined ? this.props.data : this.props.code}
                updateCity = {this.updateCity}
                addCity = {this.addCity}
              />
              :
              <div>
              <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
                <Typography >
                City :
                </Typography>
                <Typography>
                {this.props.data["name"]}
                </Typography>
              </Box>
              <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
                <Typography >
                District :
                </Typography>
                <Typography>
                {this.props.data["district"]}
                </Typography>
              </Box>
              <Box component="span" display="block" p={1} m={1} bgcolor="background.paper" textOverflow="ellipsis">
                <Typography >
                Population :
                </Typography>
                <Typography>
                {this.props.data["population"]}
                </Typography>
              </Box>
              <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justify="center"
                >
                <Button className = {classes.deleteButton} variant="contained" onClick = {this.handleDelete}>
                  <img src={del} alt="del" width="20px" height="20px"/>
                </Button>
                <Button className = {classes.editButton} variant = "contained" onClick = {this.handleEdit}>
                  <img src={edit} alt="edit" width="20px" height="20px"/>
                </Button>
              </Grid>
              </div>
            }
          </div>
        </Modal>
      </div>
    );

  }
}

City.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(City);
