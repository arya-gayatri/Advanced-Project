import React, { Component } from 'react';
import {MediaBox,Button,Card,Row, Col,Modal} from 'react-materialize';
import myimage from './mountaintop.JPG';
import './App.css';
import {AnimatedSphere} from './AnimatedSphere.js';





function ImageRender(props){
  return(
  <div className={'ImageRender ImageRender-' }>
      {props.children}
    </div>);
}

class PatientForm extends Component {

  constructor(props) {
    super(props);
    this.state = {who:  '',
                  what: '',
                  when: '',
                  where:'',
                  why:  '',};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({who: event.target.who,
    what:event.target.what,
    when: event.target.when,
    where:event.target.where,
    why: event.target.why});
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Who is in this photo?
          <input type="text" value={this.who} onChange={this.handleChange} />
        </label>
        <label>
          Who is in this photo?
          <input type="text" value={this.who} onChange={this.handleChange} />
        </label><label>
          Who is in this photo?
          <input type="text" value={this.who} onChange={this.handleChange} />
        </label><label>
          Who is in this photo?
          <input type="text" value={this.who} onChange={this.handleChange} />
        </label><label>
          Who is in this photo?
          <input type="text" value={this.who} onChange={this.handleChange} />
        </label>

        <input type="submit" value="Submit" className="btn blue"/>
      </form>
    );
  }
}

class PictureCard extends Component {
 render(){
  return(
    <div>
    <ImageRender>
    <img className={'Card-Style','Img-Style'} src={myimage}/>
    </ImageRender>
    </div>
  );
}}

class InputCard extends Component {
  constructor(props){
    super(props);
    this.state={

    }
  }
 render(){
  return(
  <Card Style={{width:'500px'}} className={'Card-Style'}>
  <PatientForm/>
  <Button className={'blue'} > Tell us More!</Button>
  </Card>
  );
}}

class AnswerCard extends Component{
  render(){
    if(this.props.showAnswerComponent)
      return(
        <Card Style={{width:'500px'}}>
        </Card>
      );
      else
      return(null);
  }
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      logedin: false ,
      showAnswerComponent: false,
      rowwidth:6,
      momentid: null,
      who: "",
      when: "",
      where: "",
      what: "",
      why: "",
      id: ""
    }

  }
  componentDidMount(){
       fetch('http://localhost:1337/getmomentinfo/hi?id=1')
           .then( result => result.json())
           .then( items => {
           this.setState({who: items.who,
           when: items.when,
           where: items.when,
           what: items.what,
           why: items.why,
           id: items.id})}
           );
  }
  showAnswers(){
    this.setState({showAnswerComponent:true,rowwidth:4});
  }
  getNextMoment(){
    this.setState({showAnswerComponent:false,rowwidth:6});
  }
  handleSubmit(){
    this.setState({logedin:true,});
  }

  render() {
 if(this.state.logedin){
    return (
    <div>
    <div Style={{paddingtop:'20px'}}></div>
    <Row>
    <Col s={this.state.rowwidth} >
    <PictureCard />
    </Col>
    <Col s={this.state.rowwidth}>
    <InputCard/>
    <button Style={{position: 'absolute',
      bottom: '0px',
      left: '25%',
      transform: 'translate(-50%, -50%)',
      zIndex: '9999',}} onClick={() => this.showAnswers()}> Show Answers </button>
      <button Style={{position: 'absolute',
        bottom: '0px',
        left: '25%',
        transform: 'translate(-50%, -50%)',
        zIndex: '9999',}} onClick={() => this.getNextMoment()}> Next </button>
    </Col>
    <Col s={this.state.rowwidth}>
    <AnswerCard showAnswerComponent={this.state.showAnswerComponent}/>
    </Col>

    </Row>

    </div>
  );}
  else{
    return(
      <div>
      <center>
  <div style={ {position: 'absolute',
    bottom: '0px',
    left: '25%',
    transform: 'translate(-50%, -50%)',
    zIndex: '9999',} } className='Card-Style'>
  <form onSubmit={this.handleSubmit}>
    <label>
      username
      <input type="text" value={this.username} onChange={this.handleChange} />
    </label>
    <label>
      password
      <input type="text" value={this.username} onChange={this.handleChange} />
    </label>
    <input type="submit" value="Submit" onClick={()=> this.handleSubmit()} className="btn blue"/>
    </form>

  </div>
  </center>
  </div>
     );
  }
  }
}


export default App;
