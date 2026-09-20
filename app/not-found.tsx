import { Link } from "expo-router";
import { StyleSheet,Text,View } from "react-native";
export default function NotFound(){return <View style={s.page}><Text style={s.title}>Página não encontrada</Text><Text>O endereço solicitado não existe.</Text><Link href="/" style={s.link}>Voltar ao início</Link></View>}
const s=StyleSheet.create({page:{flex:1,alignItems:"center",justifyContent:"center",padding:20,gap:12},title:{fontSize:24,fontWeight:"700"},link:{marginTop:8}});
