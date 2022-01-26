import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";

export default function App() {
  // 상단 메인 메뉴 상태 관리
  const [myPractice, setmyPractice] = useState(true);
  const searchMode = () => setmyPractice(false);
  const practiceMode = () => setmyPractice(true);

  // 텍스트 상자 입력 내용 관리
  const [text, setText] = useState("");

  // 검색어 입력 시 실시간 상태 변동을 통해 문장 리스트 다시 랜더링
  const [searchList, setsearchList] = useState({
    1: { item: "a", itemStatus: true },
    2: { item: "b", itemStatus: true },
    3: { item: "c", itemStatus: true },
  });

  // 텍스트 입력 상태 관리
  const onChangeText = (payload) => {
    setText(payload);

    if (!myPractice) {
      searchItem(payload);
    }
  };

  // Study "hashmap" -> {}
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    loadTodos();
  });

  // 목록 폰에 저장
  const saveTodos = async (toSave) => {
    try {
      const saveValue = JSON.stringify(toSave);
      await AsyncStorage.setItem(STORAGE_KEY, saveValue);
    } catch (e) {
      // error
    }
  };

  // 목록 불러오기
  const loadTodos = async () => {
    try {
      const loadValues = await AsyncStorage.getItem(STORAGE_KEY);

      return loadValues != null ? setToDos(JSON.parse(loadValues)) : null;
    } catch (e) {
      // error
    }
  };

  // 목록 추가
  const addTodo = async () => {
    // 텍스트 입력이 없는 경우 아무것도 하지 않음

    if (text === "") {
      return;
    }
    // 텍스트가 있는 경우 목록 추가 -> object 병합 방식
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, myPractice },
    };
    setToDos(newToDos);
    console.log(newToDos);
    await saveTodos(newToDos);
    setText("");
  };

  const deleteTodo = async (key) => {
    const newTodos = { ...toDos };
    delete newTodos[key];
    setToDos(newTodos);
    await saveTodos(newTodos);
  };

  //주어진 문장 중에 검색하기
  const searchItem = (searchText = text) => {
    //검색어를 모두 지운 경우에는 모든 리스트가 나오도록 변경
    if (searchText === "") {
      Object.keys(searchList).map((key) => {
        searchList[key].itemStatus = true;
      });
      return;
    }

    // 검색어가 있는 경우에 해당 검색어를 포함하는 문장만 View에 보여준다.
    // 검색어가 포함되지 않은 문장은 '상태를 false'로 변경하여 리스트에서 삭제
    // 텍스트 비교 알고리즘
    // 텍스트 비교하여 key값 추출 후, 해당 key의 object만 비활성화
    if (searchText === "z") {
      Object.keys(searchList).map((key) => {
        searchList[key].itemStatus = false;
      });
    }
    //검색 함수
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 상단 메뉴 2개 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={practiceMode}>
          <Text
            style={{
              ...styles.btnText,
              color: myPractice ? "white" : theme.grey,
            }}
          >
            Practice
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={searchMode}>
          <Text
            style={{
              ...styles.btnText,
              color: !myPractice ? "white" : theme.grey,
            }}
          >
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* 검색 또는 문장 입력하는 텍스트 박스 */}
      <View>
        <TextInput
          returnKeyType="done"
          multiline
          onChangeText={onChangeText}
          value={text}
          onSubmitEditing={myPractice ? addTodo : searchItem}
          placeholderTextColor="#AF7AC5"
          placeholder={myPractice ? "Write the sentence!" : "Search"}
          style={styles.input}
        ></TextInput>
      </View>

      {/* 문장들 나오는 섹션 */}

      {myPractice ? (
        <ScrollView>
          {/* Practice 모드와 Seearch 모드에서 다른 리스트 나오도록 설정 */}
          {Object.keys(toDos).map((key) =>
            toDos[key].myPractice === myPractice ? (
              <View style={styles.toDo} key={key}>
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
                <TouchableOpacity
                  hitSlop={{ top: 32, bottom: 32, left: 32, right: 32 }}
                  onPress={() => deleteTodo(key)}
                >
                  <Text style={styles.toDoDel}>DEL</Text>
                </TouchableOpacity>
              </View>
            ) : null
          )}
        </ScrollView>
      ) : (
        <ScrollView>
          {Object.keys(searchList).map((key) =>
            searchList[key].itemStatus ? (
              <View style={styles.bsEngList} key={key}>
                <Text style={styles.bsEngText}>{searchList[key].item}</Text>
              </View>
            ) : null
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 80,
  },
  btnText: {
    fontSize: 35,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 15,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.todoBg,
    marginBottom: 10,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  toDoDel: {
    fontSize: 30,
  },
  bsEngList: {
    backgroundColor: "red",
    marginBottom: 10,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 15,
  },
  bsEngText: {
    color: "blue",
    fontSize: 16,
    fontWeight: "500",
  },
});
