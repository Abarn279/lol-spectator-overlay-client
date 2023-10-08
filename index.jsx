import React, { useState } from 'react';
import * as Yup from 'yup';



import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

const schema = Yup.object().shape({
    streamTitle: Yup.string()
        .required('Stream title is required')
        .max(50),
    homeTeam: Yup.number()
        .required("Home team is required")
        .integer()
        .min(0)
        .max(5),
    awayTeam: Yup.number()
        .required("Away team is required")
        .integer()
        .min(0)
        .max(5)
        .when(["homeTeam"], (homeTeam, schema) => {
            console.log(schema)
            return schema.notOneOf([homeTeam, "Home Team and Away Team can't be equal!"])
        }),
    homeTeamScore: Yup.number()
        .required()
        .integer()
        .min(0)
        .max(3),
})

// const App = () => {
//     return <>React Successful!</>
// }