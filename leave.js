
var db = firebase.firestore()
var monthNamesThai = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤษจิกายน","ธันวาคม"];
let result_data = ''
var ListOfLeave =[]
var ListOfUser =[]

async function getLeave(){
    await db.collection("leave").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var ListOfLeaveUser =[]
        var myJSON = JSON.parse(JSON.stringify(doc.data()));
        ListOfUser.push(doc.id)
        for (var key in myJSON) { 
          var tmp =[]
          var strDateLeave = key.split(" ")
          var dateLeave = new Date(Number(strDateLeave[2])-543,monthNamesThai.indexOf(strDateLeave[1]),strDateLeave[0])
          tmp.push(dateLeave)
          var myLeave = JSON.parse(JSON.stringify(myJSON[key]));
          tmp.push(myLeave.title)
          strDateLeave = myLeave.date_start.split("/")
          dateLeave = new Date(Number(strDateLeave[2])-543,strDateLeave[1]-1,strDateLeave[0])
          tmp.push(dateLeave)
          strDateLeave = myLeave.date_end.split("/")
          dateLeave = new Date(Number(strDateLeave[2])-543,strDateLeave[1]-1,strDateLeave[0])
          tmp.push(dateLeave)
          tmp.push(myLeave.description)
          tmp.push(myLeave.status)
          tmp.push(myLeave.time_start)
          tmp.push(myLeave.time_end)
          ListOfLeaveUser.push(tmp)
        }
        ListOfLeave.push(_.sortBy(ListOfLeaveUser, '0').reverse())
      })
    })
}

async function GetUser(){
  await getLeave()
  let uniqueUser = ListOfUser
  ListOfUser=[]

    await db.collection("user").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var data = JSON.parse(JSON.stringify(doc.data()))

        uniqueUser.forEach(x=>{
          if(doc.id === x){
            var prefix = data.prefix.split("/")
            ListOfUser.push(prefix[0]+data.name+" "+data.lastname)
          }
        })
        
      })
    })
}

function createTable(tmp) {

result_data = `<table class="table table-hover" style="width: 80%;" >`
if(ListOfUser.length > 0){

      for(var j=0;j<ListOfLeave.length;j++){
        result_data+=`<tr><td> <button class="collapsible">`+ListOfUser[j]+`</button><div class="content">`
        result_data+=`
        <table class="table">
          <tr>
              <td >วันที่ขอลา</td>
              <td >สาเหตุ</td>
              <td >วันที่เริ่ม</td>
              <td >วันที่สิ้นสุด</td>
              <td >เวลาที่ลาเริ่ม</td>
              <td >เวลาที่ลาสิ้นสุด</td>
              <td >คำอธิบาย</td>
              <td >สถานะ</td>
          </tr>`
        
        for(var k=0;k<ListOfLeave[j].length;k++){
          result_data+=`<tr>`
          result_data+=`<td>`+ListOfLeave[j][k][0].toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'})+`</td>`
          result_data+=`<td>`+ListOfLeave[j][k][1]+`</td>`
          result_data+=`<td>`+ListOfLeave[j][k][2].toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'})+`</td>`
          result_data+=`<td>`+ListOfLeave[j][k][3].toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'})+`</td>`
          
          if(ListOfLeave[j][k][6]){
            result_data+=`<td>`+ListOfLeave[j][k][6]+`</td>`
          }else{
            result_data+=`<td>ไม่มีข้อมูล</td>`
          }
          
          if(ListOfLeave[j][k][7]){
            result_data+=`<td>`+ListOfLeave[j][k][7]+`</td>`
          }else{
            result_data+=`<td>ไม่มีข้อมูล</td>`
          }

          if(ListOfLeave[j][k][4]){
            result_data+=`<td>`+ListOfLeave[j][k][4]+`</td>`
          }else{
            result_data+=`<td>ไม่มีข้อมูล</td>`
          }
          
          result_data+=`<td>`+ListOfLeave[j][k][5]+`</td>`
          result_data+=`</tr>`
        }
        
        result_data+=`</table>`
        result_data+=`</div></td></tr>`
      }
      


  
}else{
  result_data += `<tr><td><button class="collapsible">ไม่มีข้อมูล</button>
  <div class="content"></div></td></tr>`
}

result_data += `</table>`

}

async function main(){
  await GetUser()
  await createTable(ListOfLeave)
  // console.log(ListOfLeave)
}
