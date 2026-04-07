import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";
import FontAwesome5  from "@expo/vector-icons/FontAwesome5";
import Foundation from "@expo/vector-icons/Foundation";

const Tabroot = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name='index'
        options={{
          title: "Master",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='home' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='transaction'
        options={{
          title: "Transaction",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name='cash-register' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='report'
        options={{
          title: "Report",
          tabBarIcon: ({ color, size }) => (
            <Foundation name='page-multiple' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default Tabroot;
