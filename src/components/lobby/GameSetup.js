import React from 'react';
import { api, handleError } from '../../helpers/api';
import { Button } from '../../views/design/Button';
import { withRouter } from 'react-router-dom';
import styles from './Lobby.module.css';
import {InputField} from "../../views/design/InputField";
import {Slider} from "../../views/design/Slider";

class Lobby extends React.Component {

    async createGame() {
        try {
            // request setup
            const url = `/game/create`;
            const requestBody = JSON.stringify({
                name: document.getElementById('name').value,
                subreddit: document.getElementById('subreddit').value,
                maxPlayers: document.getElementById('maxPlayers').value,
                password: document.getElementById('password').value,
                roundTimer: document.getElementById('roundTimer').value,
                noRounds: document.getElementById('noRounds').value,
            });
            const config = {
                headers: {
                    'userId': localStorage.getItem('userId'),
                    'token': localStorage.getItem('token')
                }
            };

            // send request
            const response = await api.post(url, requestBody, config);
            console.log(response);
            return response.data;

        } catch (error) {
            alert(`Something went wrong creating the game: \n${handleError(error)}`);
        }
    }

    render() {
        return (
            <div className={styles.Content}>
                <div className={styles.ContentBox}>
                    <div className={styles.ContentTitle}>Game Setup</div>
                    <div className={styles.Form}>
                        <table>
                            {this.inputRow('Name', 'name')}
                            {this.inputRow('Test', 'test')}
                            {this.inputRow('Subreddit', 'subreddit')}
                            {this.inputRow('Password', 'password')}
                            {this.sliderRow('Max. Players', 'maxPlayers', 3, 10, 6)}
                            {this.sliderRow('Round Timer', 'roundTimer', 20, 180, 30)}
                            {this.sliderRow('Number of Rounds', 'noRounds', 1, 30, 10)}
                        </table>
                    </div>

                    <div className={styles.ContentBox}>
                        <Button
                            width="50%"
                            onClick={() => {
                                this.props.history.push('/');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            width="50%"
                            onClick={() => {
                                let game = this.createGame();
                                this.props.history.push(`/game/${game.gameId}`);
                            }}
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    inputRow(label, attribute) {
        return (
            <tr>
                <th><div className={styles.Settings}>{label}</div></th>
                <td>
                    <InputField
                        id={attribute}
                        placeholder="Enter here.."
                        />
                </td>
            </tr>
        );
    }

    sliderRow(label, attribute, min, max, def) {
        return (
            <tr>
                <th><div className={styles.Settings}>{label}</div></th>
                <td>
                    <Slider
                        id={attribute}
                        min={min}
                        max={max}
                    />
                </td>
            </tr>
        );
    }

}

export default withRouter(Lobby);
