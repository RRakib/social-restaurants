import React, {useEffect, useState} from 'react';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {API_KEY} from './env';
import {windowWidth} from './utility/helper';
import Carousel from 'react-native-reanimated-carousel';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

let time = 0;

interface RestaurantsInterface {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  rating?: number;
  types: string[];
  vicinity?: string;
  place_id?: string;
  icons?: string;
}

function App(): JSX.Element {
  const [myLocation, setMyLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 10,
    longitude: 10,
  });
  const [showDirection, setShowDirection] = useState<boolean>(false);
  const [restaurants, setRestaurants] = useState<RestaurantsInterface[]>([]);
  const [selectedRestaurants, setSelectedRestaurants] =
    useState<RestaurantsInterface | null>(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(info => {
      console.log(info);
      setMyLocation({
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    if (time < Date.now()) {
      fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.4226711,-122.0849872&radius=1000&type=restaurant&key=${API_KEY}`,
        {
          method: 'get',
          headers: {},
        },
      )
        .then(res => {
          return res.json();
        })
        .then(res => {
          setRestaurants(res.results);
          time = Date.now() + 10000;
        });
    }
  }, []);

  const renderRestaurants =
    restaurants &&
    restaurants.map((item, index) => {
      return (
        <Marker
          key={index}
          coordinate={{
            latitude: item.geometry.location.lat,
            longitude: item.geometry.location.lng,
          }}
          onPress={() => {
            setSelectedRestaurants(item);
          }}
          image={{
            uri: 'https://i.ibb.co/h9zsxNB/Group-5.png',
            scale: selectedRestaurants
              ? selectedRestaurants.place_id === item.place_id
                ? 1
                : 0.6
              : 0.6,
          }}
        />
      );
    });

  console.log(selectedRestaurants);

  const selectedRestaurantCoordicates = selectedRestaurants
    ? {
        latitude: selectedRestaurants.geometry.location.lat,
        longitude: selectedRestaurants.geometry.location.lng,
      }
    : {
        latitude: 0,
        longitude: 0,
      };

  const listOfRestaurants = restaurants.length ? (
    restaurants.map((item, index) => {
      return (
        <View style={styles.restaurantDetailsContainer} key={index}>
          <View style={styles.restaurantDetails}>
            <Text style={styles.headingMain}>{item.name}</Text>
            <View style={styles.section}>
              <Text style={styles.heading}>Rating</Text>
              <Text>{item.rating}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.heading}>Vicinity</Text>
              <Text>{item.vicinity}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.heading}>Category</Text>
              <Text style={styles.capitalize}>{item?.types.join(', ')}</Text>
            </View>
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={{
                  ...styles.goingButton,
                  width: 120,
                  marginRight: 10,
                  backgroundColor: '#F3A242',
                }}
                onPress={() => {
                  setShowDirection(true);
                }}
                activeOpacity={0.8}>
                <Text style={styles.goingText}>Direction</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.goingButton} activeOpacity={0.8}>
                <Text style={styles.goingText}>Going</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    })
  ) : (
    <></>
  );

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={'default'} />
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View>
            <MapView
              zoomEnabled={true}
              loadingEnabled={true}
              zoomControlEnabled={true}
              showsMyLocationButton={true}
              showsUserLocation={true}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={{
                ...myLocation,
                latitudeDelta: 0.035,
                longitudeDelta: 0.0321,
              }}>
              {renderRestaurants}
              {showDirection && (
                <Polyline
                  coordinates={[myLocation, selectedRestaurantCoordicates]}
                  strokeWidth={3}
                />
              )}
            </MapView>
          </View>
        </ScrollView>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}>
          {listOfRestaurants}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width: windowWidth,
    backgroundColor: 'light-gray',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    width: 400,
    height: 450,
  },
  restaurantDetailsContainer: {
    display: 'flex',
    width: windowWidth,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantDetails: {
    width: '95%',
    padding: 8,
    margin: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  heading: {
    color: '#444',
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 3,
  },
  section: {
    marginBottom: 8,
  },
  headingMain: {
    fontSize: 22,
    color: '#1c1c1c',
    fontWeight: '600',
    marginBottom: 15,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  goingButton: {
    height: 40,
    width: 80,
    marginTop: 10,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4293F3',
  },
  goingText: {
    color: 'white',
    fontSize: 18,
  },
});

export default App;
