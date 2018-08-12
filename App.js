

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FBSDK, {
  LoginManager, LoginButton,
  AccessToken, GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';


export default class App extends Component {

  _fbAuth() {
    LoginManager.logInWithReadPermissions(['public_profile']).then(
      function (result) {
        if (result.isCancelled) {
          alert('Login cancelled');
        } else {
          alert('Login success with permissions: '
            + result.grantedPermissions._responseInfoCallback());
          jsonData = JSON.stringify(result);
          console.log(jsonData)
        }
      },
      function (error) {
        alert('Login fail with error: ' + error);
      })

  }

  async fbLogin({ accessToken }) {
    const { login } = this.props;
    /* SIGN IN FACEBOOK  */
    const responseInfoCallback = async (error, result) => {
      if (error) {
      } else {
        jsonData = JSON.stringify(result); // result => JSON
        const userData = await JSON.parse(jsonData);
        const user = await BuzlinWorker.socialLogin(userData.email, userData.first_name, userData.last_name);
        if (user === undefined) {
          this.stopAndToast('Can\'t get data from server');
        } else if (user.error) {
          this.stopAndToast(user.error);
        } else {
          let customers = await BuzlinWorker.getCustomerByEmail(user.user.email);
          let username = user.user.email;
          customers = { ...customers, username };
          this.setState({ isLoading: false });
          login(customers, user.token);
        }

      }
    }
    const infoRequest = new GraphRequest(
      '/me',
      {
        accessToken: accessToken.toString(),
        parameters: {
          fields: {
            string: 'email,name, first_name, last_name'
          }
        }
      },
      responseInfoCallback
    );
    // Start the graph request.
    new GraphRequestManager().addRequest(infoRequest).start();
  }
  // Create a graph request asking for user information with a callback to handle the response.

  render() {
    return (
      <View style={styles.container}>
        <LoginButton
          onLoginFinished={
            (error, result) => {
              if (error) {
                alert("login has error: " + result.error);
              } else if (result.isCancelled) {
                alert("login is cancelled.");
              } else {

                AccessToken.getCurrentAccessToken().then(
                  (data) => {
                    let accessToken = data.accessToken
                    alert(accessToken.toString())

                    const responseInfoCallback = (error, result) => {
                      if (error) {
                        console.log(error)
                        alert('Error fetching data: ' + error.toString());
                      } else {
                        console.log(result)
                        alert('Success fetching data: ' + result.toString());
                      }
                    }

                    const infoRequest = new GraphRequest(
                      '/me',
                      {
                        accessToken: accessToken,
                        parameters: {
                          fields: {
                            string: 'email,name,first_name,middle_name,last_name'
                          }
                        }
                      },
                      responseInfoCallback
                    );

                    // Start the graph request.
                    new GraphRequestManager().addRequest(infoRequest).start()

                  }
                )

              }
            }
          }
          onLogoutFinished={() => alert("logout.")} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
