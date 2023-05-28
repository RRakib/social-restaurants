import {decode} from '@mapbox/polyline';
import React, {useEffect, useState} from 'react';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {
  Image,
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
  const [coOrdinates, setCoOrdinates] = useState<any>([]);
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
    if (myLocation.latitude === 10) {
      return;
    }
    (async () => {
      if (time < Date.now()) {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${myLocation.latitude},${myLocation.longitude}&radius=1500&type=restaurant&key=${API_KEY}`,
        );
        const respJson = await res.json();
        console.log(respJson, 65);
        setRestaurants(respJson.results);
        setSelectedRestaurants(respJson.results[0]);
        time = Date.now() + 10000;
      }
    })();
  }, [myLocation.latitude, myLocation.longitude]);

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
            setCoOrdinates([]);
            setSelectedRestaurants(item);
          }}>
          <View style={{...styles.flexCenter, width: 60, padding: 10}}>
            <View
              style={{
                ...styles.customMarker,
                width: selectedRestaurants
                  ? selectedRestaurants!.place_id === item.place_id
                    ? 60
                    : 50
                  : 50,
                padding: selectedRestaurants
                  ? selectedRestaurants!.place_id === item.place_id
                    ? 8
                    : 3
                  : 3,
              }}>
              <Image
                style={styles.tinyLogo}
                source={{uri: 'https://i.ibb.co/HPJmjTj/Vector.png'}}
              />
              <Text style={{color: 'white'}}>{item.rating}</Text>
              <View style={styles.arrow} />
            </View>
          </View>
        </Marker>
      );
    });

  const getCoordicates = async () => {
    if (!selectedRestaurants) {
      return null;
    }
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${myLocation.latitude},${myLocation.longitude}&destination=${selectedRestaurants.geometry.location.lat},${selectedRestaurants.geometry.location.lng}&key=${API_KEY}`,
    );
    let respJson = await res.json();
    let points = decode(respJson.routes[0].overview_polyline.points);
    let coords = points.map((point: any[]) => {
      return {
        latitude: point[0],
        longitude: point[1],
      };
    });
    setCoOrdinates(coords);
  };

  const renderSelectedRestaurant = selectedRestaurants && (
    <View style={styles.restaurantDetailsContainer}>
      <View style={styles.restaurantDetails}>
        <Text style={styles.headingMain}>{selectedRestaurants.name}</Text>
        <View style={styles.section}>
          <Text style={styles.heading}>Rating</Text>
          <Text>{selectedRestaurants.rating}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Vicinity</Text>
          <Text>{selectedRestaurants.vicinity}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Category</Text>
          <Text style={styles.capitalize}>
            {selectedRestaurants?.types.join(', ')}
          </Text>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={{
              ...styles.goingButton,
              width: 120,
              marginRight: 10,
              backgroundColor: '#F3A242',
            }}
            onPress={getCoordicates}
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

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={'light-content'} />
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View>
            <MapView
              zoomEnabled={true}
              loadingEnabled={true}
              zoomControlEnabled={true}
              followsUserLocation={true}
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
              {coOrdinates.length ? (
                <Polyline
                  strokeColor={'#1c1c1c'}
                  coordinates={coOrdinates}
                  strokeWidth={5}
                />
              ) : (
                <></>
              )}
            </MapView>
          </View>
          <View>{renderSelectedRestaurant}</View>
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
  flexCenter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customMarker: {
    backgroundColor: '#F85151',
    borderRadius: 8,
    borderColor: '#BA2222',
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tinyLogo: {
    width: 15,
    height: 15,
    marginTop: 4,
    marginRight: 2,
  },
  arrow: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#BA2222',
  },
});

export default App;
