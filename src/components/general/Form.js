import React from 'react';
import styled from 'styled-components';
import {Button, InputField, LinkButton, Option, Select, Slider, SliderLabel} from '../../views/design/Interaction';
import {FlexBox, MediumForm, VerticalScroller} from "../../views/design/Containers";
import {Error, Label, Title} from "../../views/design/Text";


const Row = styled.tr`
    display: table-row;
`;

const Cell = styled.td`
    height: 100%;
    display: table-cell;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 5px;
    padding-bottom: 5px;
`;

const SettingsLabel = styled.h2`
    font-size: 16px;
    color: #666666;
    display: table-cell;
    horizontal-align: center;
    vertical-align: middle;
    text-align: center;
    padding-left: 20px;
    padding-right: 20px;
`;

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props['initialState']? this.props['initialState'] : {};
  }

  handleInputChange(key, value) {
    // since the form itself has no use for the data, we only update the listener.
    this.setState({[key]: value});
    if (this.props.listener) {
      this.props.listener.handleInputChange(key, value);
    }
  }

  nextRequired() {
    for (let attribute of this.props.attributes) {
      if (attribute.required && !this.state[attribute.key]) return attribute;
    }
    return null;
  }

  componentDidUpdate(props, current_state) {
    if(!this.props["isGamemaster"] && this.props['withApplyButton']){
      for(let attr of this.props.attributes){
        if (current_state[attr.key] !== props.listener.props.game[attr.key]) {
          this.setState({[attr.key]:props.listener.props.game[attr.key]})
        }
      }
    }
    return null
  }

  render() {
    return (
        <MediumForm>
          {this.props.title? <Title> { this.props.title } </Title> : null}

          <table>

            {!this.props.attributes? null : this.props.attributes.map(attribute => {
              return this.state[`${attribute.group}Collapsed`]? null :
                  <Row>
                    <Cell><Label id={`${attribute.key}Label`}> {`${attribute.label}${attribute.required? '*':''}`} </Label></Cell>
                    <Cell>{ this.inputComponent(attribute) }</Cell>
                  </Row>
            })}

            {this.nextRequired()?
                <Row>
                  <Cell/>
                  <Cell style={{paddingTop:'0'}}><Error style={{margin:'0'}}> {`*${this.nextRequired().label} required.`} </Error></Cell>
                </Row>
                : null}
            {this.props['withApplyButton'] && this.props["isGamemaster"]? <Row>
                  <Cell>
                    <Button
                        width='100%'
                        onClick={this.props['onApply']}
                        { ...this.props['applyButtonProps'] }
                        disabled={this.props["settingsUpdated"]}
                    >
                      {this.props.applyButtonText? this.props.applyButtonText : 'Apply'}
                    </Button>
                  </Cell>

                    {this.props["settingsUpdated"]?
                        <Cell>
                          <SettingsLabel
                              style={{text_align: "center"}}>Settings updated</SettingsLabel>
                        </Cell>
                      :<Cell>
                          <SettingsLabel>Settings not applied</SettingsLabel>
                      </Cell>}


                </Row> : null}
            <Row>
              <Cell>
                {this.props['withoutCancelButton']? null :
                    <Button
                        width='100%'
                        onClick={this.props['onCancel']}
                        { ...this.props['cancelButtonProps'] }
                    >
                      {this.props.cancelButtonText? this.props.cancelButtonText : 'Cancel'}
                    </Button>}
              </Cell>
              <Cell>
                {this.props['withoutSubmitButton']? null :
                <Button
                    width='100%'
                    onClick={this.props['onSubmit']}
                    disabled={this.props['submitCondition']? !this.props['submitCondition']() : this.nextRequired()}
                    { ...this.props['submitButtonProps'] }
                >
                  {this.props.submitButtonText? this.props.submitButtonText : 'Submit'}
                </Button>}
              </Cell>
            </Row>
          </table>

        </MediumForm>
    );
  }

  inputComponent(attribute) {
    switch(attribute.type) {
      case 'Input':
        return <InputField
            id={ attribute.key }
            value={this.state[attribute.key]}
            onChange={e => {this.handleInputChange(attribute.key, e.target.value)}}
            { ...attribute.props }
        />;

      case 'Range':
        return <FlexBox>
          <Slider
              id={ attribute.key }
              defaultValue={this.state[attribute.key]}
              onChange={e => {this.handleInputChange(attribute.key, e.target.value)}}
              { ...attribute.props }

          />
          <SliderLabel>
            { this.state[attribute.key] }
          </SliderLabel>
        </FlexBox>;

      case 'Select':
        return <Select
            id={ attribute.key }
            value={this.state[attribute.key]}
            onChange={e => {this.handleInputChange(attribute.key, e.target.value)}}
            { ...attribute.props }
        >
          {attribute.options.map(option => {
            return <Option value={option.value}>{option.name}</Option>
          })}
        </Select>;

      case 'Group':
        return <LinkButton
              onClick={ e => {
                this.setState({[`${attribute.key}Collapsed`]: !this.state[`${attribute.key}Collapsed`],});
              }}>
            {this.state[`${attribute.key}Collapsed`]? 'expand' : 'collapse'}
          </LinkButton>;

      default: return null;
    }
  }

}

export default Form;
