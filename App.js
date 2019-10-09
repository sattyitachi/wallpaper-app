
import React from 'react';
import { Text, StyleSheet, View, ActivityIndicator, FlatList, Dimensions, Image, Animated, TouchableWithoutFeedback, TouchableOpacity, CameraRoll } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { FileSystem } from 'expo';
import { Permissions } from 'expo-permissions';
const { height, width } = Dimensions.get('window')
export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
      images: [],
      scale: new Animated.Value(1),
      isImageFocused: false
    };
  }

  loadWallpapers = () => {
    axios
      .get('http://api.unsplash.com/photos/random?count=30&client_id=8442ed0f96cc5398d743e09e2ea07fed4c3c6e867e4df4d73da9bea607daa871')
      .then(function (response) {
        console.log(response.data);
        this.setState({ images: response.data, isLoading: false });
      }.bind(this)
      )
      .catch(function (error) {
        console.log(error);
      })
      .finally(function () {
        console.log('request completed');
      });

  }

  componentDidMount() {
    this.loadWallpapers()
  }
  saveToCameraRoll = async (image) => {
    let cameraPermissions = await Permissions.getAsync
      (Permissions.CAMERA_ROLL);
    if (cameraPermissions.status !== 'granted') {
      cameraPermissions = await Permissions.getAsync
        (Permissions.CAMERA_ROLL);
    }
    if (cameraPermissions.status == 'granted') {
      FileSystem.downloadAsync(image.urls.regular,
        FileSystem.documentDirectory + image.id + '.jpg').then(({ uri }) => {
          CameraRoll.saveToCameraRoll(uri);
          alert('saved')
        }).catch(error => {
          console.log(error);

        });


    }
    else {
      alert('requires permission');
    }
  }

  showControls = (item) => {
    this.setState((state) => ({
      isImageFocused: !state.isImageFocused
    }), () => {
      if (this.state.isImageFocused) {
        Animated.spring(this.state.scale, {
          toValue: 0.9,
          useNativeDriver: true,
        }).start()
      } else {
        Animated.spring(this.state.scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start()
      }
    })
  }


  renderItem = ({ item }) => {

    let scaleAnimation = {
      transform: [{ scale: this.state.scale }]
    }

    const actionBarY = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [0, 80]
    });

    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ActivityIndicator size="large" color="grey" />
        </View>
        <TouchableWithoutFeedback onPress={() => this.showControls(item)}>
          <Animated.View style={[{ height, width }, scaleAnimation]}>
            <Image
              style={{ flex: 1, height: null, width: null }}
              source={{ uri: item.urls.regular }}
              resizeMode="cover"
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View
          style={[{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 80,
            backgroundColor: '#031740',
            flexDirection: 'row',
            justifyContent: 'space-around',
          },
          { transform: [{ translateY: actionBarY }] }]}>

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.loadWallpapers()}>

              <Ionicons name="ios-refresh" color="#fff" size={40} />

            </TouchableOpacity>
          </View>


        </Animated.View>

      </View>
    )
  }
  render() {

    return this.state.isLoading ? (
      <View
        style={{
          flex: 1,
          backgroundColor: 'black',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <ActivityIndicator size="large" color="grey" />
      </View>
    ) : (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <FlatList
            scrollEnabled={!this.state.isImageFocused}
            horizontal
            pagingEnabled
            data={this.state.images}
            renderItem={this.renderItem}
            keyExtractor={item => item.id}
          />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
