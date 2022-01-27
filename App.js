import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
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
import { theme } from "./colors";
import { sentenceList } from "./sentence";

const STORAGE_KEY = "@exerList";

export default function App() {
  // --------------------------- 상단 메인 메뉴 상태 관리 --------------------------- //
  const [myPractice, setmyPractice] = useState(true);
  const practiceMode = () => {
    setmyPractice(true);
    setTextEng("");
    setTextKor("");
  };
  const searchMode = () => {
    setmyPractice(false);
    setTextEng("");
    setTextKor("");
  };

  // --------------------------- 텍스 입력 상자 관리 --------------------------- //
  var [textEng, setTextEng] = useState("");
  var [textKor, setTextKor] = useState("");

  // 텍스트 입력 상태 관리
  const onChangeText = (payload) => {
    // 입력된 텍스트 값 persist
    setTextEng(payload);

    // 검색 모드에서는 텍스트 입력마다 검색
    if (!myPractice) {
      //텍스트 입력이 변할 때마다 리스트를 처음부터 다시 검색
      searchAction(payload);
    }
  };

  // --------------------------- 목록 관리 --------------------------- //
  const [exerList, setexerList] = useState({});

  // 목록 불러오기
  const loadExerList = async () => {
    try {
      const loadValues = await AsyncStorage.getItem(STORAGE_KEY);
      return loadValues != null ? setexerList(JSON.parse(loadValues)) : null;
    } catch (e) {
      // error
    }
  };

  // 목록 폰에 저장
  const saveExerList = async (toSave) => {
    try {
      const saveValue = JSON.stringify(toSave);
      await AsyncStorage.setItem(STORAGE_KEY, saveValue);
    } catch (e) {
      // error
    }
  };
  useEffect(() => {
    loadExerList();
  });

  // 목록 추가
  const addExerList = async () => {
    // 텍스트 입력이 없는 경우 아무것도 하지 않음
    if (textEng === "") {
      return;
    }
    // 텍스트가 있는 경우 목록 추가 -> object 병합 방식
    const newExerList = {
      ...exerList,
      [Date.now()]: { textEng, textKor, myPractice },
    };

    setexerList(newExerList);
    await saveExerList(newExerList);
    setTextEng("");
    setTextKor("");
  };

  // 목록 삭제 -> 팝업을 통해 삭제 확인
  const deleteExerList = (key) => {
    Alert.alert(exerList[key].textEng, "문장을 삭제할까요?", [
      { text: "YES", onPress: () => deleteItem(key) },
      { text: "NO", onPress: () => console.log("cancel") },
    ]);
  };

  // 삭제 수행 함수
  const deleteItem = async (key) => {
    const newExerList = { ...exerList };
    delete newExerList[key];
    setexerList(newExerList);
    await saveExerList(newExerList);
  };

  // --------------------------- 검색 관리 --------------------------- //

  // 검색 대상 초기화
  const initialSearchItem = () => {
    Object.keys(sentenceList).map((key) => {
      sentenceList[key].searchStatus = true;
    });
  };

  // 검색 실행하기
  const searchAction = (value) => {
    initialSearchItem();
    searchItem(value);
  };

  //주어진 문장 중에 검색하기
  const searchItem = (searchText = textEng) => {
    if (searchText === "") {
      return;
    }

    // 검색어가 있는 경우에 해당 검색어를 포함하는 문장만 View에 보여준다.
    // 검색어가 포함되지 않은 문장은 '상태를 false'로 변경하여 리스트에서 삭제
    // 텍스트 비교 알고리즘(텍스트 비교하여 key값 추출 후, 해당 key의 object만 비활성화)
    if (searchText.length > 0) {
      Object.keys(sentenceList).map((key) => {
        var comparesentence = String(sentenceList[key].eng);
        if (comparesentence.indexOf(searchText) < 0)
          sentenceList[key].searchStatus = false;
      });
    }
  };

  // 검색화면의 문장을 연습문장으로 등록하기
  const addSearch = (key) => {
    textEng = sentenceList[key].eng;
    textKor = sentenceList[key].kor;

    Alert.alert(textEng, "문장을 등록할까요?", [
      { text: "YES", onPress: () => addExerList() },
      { text: "NO", onPress: () => console.log("cancel") },
    ]);
  };

  // 추가할 기능
  // 등록한 문장 수정하도록
  // 완료 버튼 추가
  // 미니 테스트 기능

  const clickList = () => {
    console.log("click list");
  };

  const clearText = () => {
    console.log("click");
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
          onFocus={clearText}
          value={textEng}
          onSubmitEditing={myPractice ? addExerList : searchItem}
          placeholderTextColor="#AF7AC5"
          placeholder={myPractice ? "Write the sentence!" : "Search"}
          style={styles.input}
        ></TextInput>
      </View>

      {/* 문장들 나오는 섹션 */}
      {/* Practice 모드와 Seearch 모드에서 다른 리스트 나오도록 설정 */}
      {myPractice ? (
        <ScrollView>
          {Object.keys(exerList).map((key) => (
            <View style={styles.toDo} key={key}>
              <Pressable onPress={() => clickList()}>
                <Text style={styles.toDoText}>{exerList[key].textEng}</Text>
              </Pressable>
              <TouchableOpacity
                hitSlop={{ top: 32, bottom: 32, left: 32, right: 32 }}
                onPress={() => deleteExerList(key)}
              >
                <AntDesign name="delete" size={25} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView>
          {Object.keys(sentenceList).map((key) =>
            sentenceList[key].searchStatus ? (
              <Pressable
                onLongPress={() => addSearch(key)}
                delayLongPress="100"
                style={styles.bsEngList}
                key={key}
              >
                <Text style={styles.bsEngText}>{sentenceList[key].eng}</Text>
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
