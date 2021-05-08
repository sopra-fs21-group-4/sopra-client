import React from 'react';
import { api, handleError } from '../../helpers/api';
import styled from 'styled-components';
import { Spinner } from '../../views/design/Spinner';
import { withRouter } from 'react-router-dom';
import {
    BackgroundDivLighter,
    HorizontalBox, VerticalBox,
    VerticalList,
    VerticalScroller
} from "../../views/design/Containers";
import {Info, Label, Title} from "../../views/design/Text";
import User from "../shared/models/User";
import parseEmoji from "../../helpers/Emoji";
import InputField from "../general/InputField";


const colorSelected = '#b5007c';
const colorUnselected = 'rgb(50,62,200)';

const VoteButton = styled.button`
  &:hover {
    transform: translateWidth(+5px);
  }
  padding: 6px;
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 13px;
  text-align: center;
  color: #000;
  width: ${props => props.width || null};
  height: 35px;
  border: none;
  border-radius: 20px;
  cursor: ${props => (props.disabled ? "default" : "pointer")};
  opacity: ${props => (props.disabled ? 0.4 : 1)};
  background: rgb(191,62,255);
  transition: all 0.3s ease;
`;

class GameRound extends React.Component {

    async vote(recipient) {
        try {
            // request setup
            const url = `/games/${this.props.match.params.gameId}/vote`;
            const config = {
                headers: User.getUserAuthentication()
            }
            const response = await api.put(url, recipient.userId, config);
            console.log(response);
        } catch (error) {
            alert(`Something went wrong while voting: \n${handleError(error)}`);
        }
    }

    async suggest() {
        try {
            let inputField = document.getElementById(`suggestionInput`);
            // request setup
            const url = `/games/${this.props.match.params.gameId}/suggest`;
            const config = {
                headers: User.getUserAuthentication()
            }
            const response = await api.put(url, inputField.value, config);
            console.log(response);
            inputField.value = "";    // reset input field

        } catch (error) {
            alert(`Something went wrong while suggesting: \n${handleError(error)}`);
        }
    }

    render() {
        if (!this.props.game || !this.props.players) {
            return <Spinner/>
        }
        return <div>

       <VerticalBox

        >
            <Title style={{
                textAlign: 'left',
                paddingLeft: '100px',
            }}>
                {this.props.game.currentRound.title}
            </Title>

            <HorizontalBox style={{justifyContent: 'left'}}>
                <img width='400px' src={this.props.game.currentRound.memeURL} />
                <BackgroundDivLighter
                style={{marginLeft:'20px',width:'500px'}}>
                <div >
                    <Label>{`${this.currentActivity()}`}</Label>
                    <br/>
                    <Info>{`time remaining: ${Math.round(this.props.game.currentCountdown / 1000)}`}</Info>
                    <br/>
                    {this.currentRoundPhaseInteractive()}
                </div>
                </BackgroundDivLighter>
            </HorizontalBox>
        </VerticalBox>

        </div>
    }

    currentActivity() {
        switch (this.props.game.currentRound.roundPhase) {
            case 'STARTING':    return'prepare!';
            case 'SUGGEST':     return 'suggest a title!';
            case 'VOTE':        return 'vote!';
            case 'AFTERMATH':   return 'admire the winner!';
            default:            return 'relax!';
        }
    }

    currentRoundPhaseInteractive() {
        let game = this.props.game;
        switch (game.currentRound.roundPhase) {
            case 'STARTING':    return null;
            case 'SUGGEST':     return this.suggestionInteractive();
            case 'VOTE':        return this.voteInteractive();
            case 'AFTERMATH':   return this.aftermathInteractive();
            default: return <Spinner />;
        }
    }

    suggestionInteractive() {
        let currentSuggestion = this.props.game.currentRound.suggestions[User.getAttribute('userId')];
        return <VerticalList >
            <Label>{currentSuggestion? "Suggestion: " + currentSuggestion : 'What title would you suggest?'}</Label>
            <div>
                <InputField
                    id={`suggestionInput`}
                    submitAction={() => this.suggest()}
                    // submitButtonText='Suggest' // too long
                    textFilters={[parseEmoji]}
                />
            </div>
        </VerticalList>
    }
    // i took out the name of the player so you dont know who you vote for, old: ${player.username}:
    // buttons are sorted alphabetically so you dont know whose title you are voting for
    voteInteractive() {
        return <VerticalList>
            {(this.props.players.map(player => {
                return (this.props.game.currentRound.suggestions[player.userId]? <VoteButton
                    disabled={player.userId == User.getAttribute('userId')}
                    onClick={e => this.vote(player)}
                    style={{background: (this.props.game.currentRound.votes[User.getAttribute('userId')] == player.userId)? colorSelected : colorUnselected}}
                >
                    {`${this.props.game.currentRound.suggestions[player.userId]}`}</VoteButton>
                : null);
            })).sort(function(a,b){
                if(!(a&&b)){return 1}
                    if (a.props.children>b.props.children){return 1}
                    else {return -1}
            })}
        </VerticalList>
    }
    // TODO remove 🅱 and replace with meaningful text
    aftermathInteractive() {
        let game = this.props.game;
        let players = this.props.players.slice();
        players.sort((a,b) => {return game.currentRound.scores[b.userId] - game.currentRound.scores[a.userId]});
        return <VerticalList>
            <Label>Scores:</Label>
            {players.map(player => {
                let suggestion = game.currentRound.suggestions[player.userId];
                let score = game.currentRound.scores[player.userId];
                return <div style={{
                    paddingBottom:'15px'
                }}>
                    <Label>{`${suggestion? suggestion : '🅱'} (${player.username}): ${score? score : '0'}`}</Label>
                </div>
            })}
        </VerticalList>
    }

}

export default withRouter(GameRound);