import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";

export default function App() {
  // 상단 메인 메뉴 상태 관리
  const [myPractice, setmyPractice] = useState(true);
  const practiceMode = () => setmyPractice(true);
  const searchMode = () => {
    setmyPractice(false);
    searchAction(text);
  };

  // 텍스트 상자 입력 내용 관리
  var [text, setText] = useState("");

  // 검색어 입력 시 실시간 상태 변동을 통해 문장 리스트 다시 랜더링
  const [searchList, setsearchList] = useState({
    1: { item: "hello world", itemStatus: true },
    2: { item: "i am a student", itemStatus: true },
    3: { item: "i am a boy", itemStatus: true },
  });

  // 텍스트 입력 상태 관리
  const onChangeText = (payload) => {
    setText(payload);

    // 검색 모드에서는 텍스트 입력마다 검색
    if (!myPractice) {
      //텍스트 입력이 변할 때마다 리스트를 처음부터 다시 검색
      searchAction(payload);
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
    } catch (e) {}
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
      [Date.now()]: { text, myPractice: true },
    };
    setToDos(newToDos);
    await saveTodos(newToDos);
    setText("");
  };

  const deleteTodo = (key) => {
    Alert.alert(toDos[key].text, "문장을 삭제할까요?", [
      { text: "YES", onPress: () => deleteAction(key) },
      { text: "NO", onPress: () => console.log("cancel") },
    ]);
  };

  const deleteAction = async (key) => {
    const newTodos = { ...toDos };
    delete newTodos[key];
    setToDos(newTodos);
    await saveTodos(newTodos);
  };

  const searchAction = (value) => {
    initialSearchItem();
    searchItem(value);
  };

  // 검색 화면에서 문장 목록 모두 나오도록 초기화
  const initialSearchItem = () => {
    Object.keys(searchList).map((key) => {
      searchList[key].itemStatus = true;
    });
  };

  //주어진 문장 중에 검색하기
  const searchItem = (searchText = text) => {
    //검색어를 모두 지운 경우에는 모든 리스트가 나오도록 변경
    if (searchText === "") {
      return;
    }

    // 검색어가 있는 경우에 해당 검색어를 포함하는 문장만 View에 보여준다.
    // 검색어가 포함되지 않은 문장은 '상태를 false'로 변경하여 리스트에서 삭제
    // 텍스트 비교 알고리즘
    // 텍스트 비교하여 key값 추출 후, 해당 key의 object만 비활성화
    if (searchText.length > 0) {
      Object.keys(searchList).map((key) => {
        var comparesentence = String(searchList[key].item);
        if (comparesentence.indexOf(searchText) < 0)
          searchList[key].itemStatus = false;
      });
    }
  };

  const addSearch = (key) => {
    text = searchList[key].item;

    Alert.alert(text, "문장을 등록할까요?", [
      { text: "YES", onPress: () => addTodo() },
      { text: "NO", onPress: () => console.log("cancel") },
    ]);
  };

  // 추가할 기능
  // 등록한 문장 수정하도록
  // 완료 버튼 추가
  // 미니 테스트 기능

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 상단 메뉴 2개 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={practiceMode}>
          <Text
            style={{
              ...styles.btnText,
              color: myPractice ? "#FFD662" : theme.grey,
            }}
          >
            Practice
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={searchMode}>
          <Text
            style={{
              ...styles.btnText,
              color: !myPractice ? "#DF678C" : theme.grey,
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
          onChangeText={onChangeText}
          value={text}
          onSubmitEditing={myPractice ? addTodo : searchItem}
          placeholderTextColor="#AF7AC5"
          placeholder={myPractice ? "Write the sentence!" : "Search"}
          style={styles.input}
        ></TextInput>
      </View>

      {/* 문장들 나오는 섹션 */}
      {/* Practice 모드와 Seearch 모드에서 다른 리스트 나오도록 설정 */}
      {myPractice ? (
        <ScrollView>
          {Object.keys(toDos).map((key) => (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity
                hitSlop={{ top: 32, bottom: 32, left: 32, right: 32 }}
                onPress={() => deleteTodo(key)}
              >
                <AntDesign name="delete" size={25} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView>
          {Object.keys(searchList).map((key) =>
            searchList[key].itemStatus ? (
              <Pressable
                onLongPress={() => addSearch(key)}
                delayLongPress="100"
                style={styles.bsEngList}
                key={key}
              >
                <Text style={styles.bsEngText}>{searchList[key].item}</Text>
              </Pressable>
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
    fontSize: 14,
  },

  // 연습화면에서 스크롤 뷰
  toDo: {
    backgroundColor: "#00539C",
    marginBottom: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  toDoDel: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },

  // 검색화면에서 스크롤 뷰
  bsEngList: {
    backgroundColor: "#3D155F",
    marginBottom: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bsEngText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
});
