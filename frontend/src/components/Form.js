import React from 'react';

import {useForm} from 'react-hook-form';

import './Styles.css';

const Form = (props) => {
  const { register, handleSubmit, errors } = useForm()

  const onSubmit = (data) => {
    if (typeof props.data !== "string") {
      props.updateCity({
        "id":props.data["id"],
        "city":data["Name"],
        "district":data["District"],
        "population":parseInt(data["Population"])
      });
    } else {
      props.addCity({
        "code":props.data,
        "city":data["Name"],
        "district":data["District"],
        "population":parseInt(data["Population"])
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
      {
        (errors.District || errors.Population || errors.Name) &&
        'All fields required'
      }
      </div>
      <label>Name</label>
      {
        typeof props.data !== "string" ?
        <input name="Name" defaultValue={props.data["name"]} ref={register({ required: true })} />
        :
        <input name="Name" ref={register({ required: true })} />
      }
      <label>District</label>
      {
        typeof props.data !== "string" ?
        <input name="District" defaultValue={props.data["district"]} ref={register({ required: true })} />
        :
        <input name="District" ref={register({ required: true })} />
      }
      <label>Population</label>
      {
        typeof props.data !== "string" ?
        <input name="Population" defaultValue={props.data["population"]} ref={register({ required: true })} />
        :
        <input name="Population" ref={register({ required: true })} />
      }
      <input className = "submit" type="submit"/>
    </form>
  )
}

export default Form
