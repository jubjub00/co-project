
var db = firebase.firestore()
var monthNamesThai = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]
const date = new Date()
var result = date.toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'})
let result_data = ''
var tmp =[]
var ListOfUser =[]
var ListOfLeave = []
var ListOfUserForLeve = []

async function GetWorking(){
  
  await db.collection("WorkingTime").get().then((querySnapshot) => {
    
    querySnapshot.forEach((doc) => {

        
        var myJSON = JSON.parse(JSON.stringify(doc.data()));
        var str = result.split(" ")

        if(str[0].length == 1){
          result = "0"+str[0]+" "+str[1]+" "+str[2]
        }else if(str[0].length == 2){
          result = str[0]+" "+str[1]+" "+str[2]
        }
        
        if(myJSON[result] ){
          
          var t = []
          var InOut = JSON.parse(JSON.stringify(myJSON[result]))
            // console.log(`${doc.id }`)
          
            ListOfUser.push(doc.id)
            if(InOut["inwork"]){
                  
                  var In = JSON.parse(JSON.stringify(InOut["inwork"]))
                  var Inn = ""
                  var i = 0
                  do{
                      if(In[i]){
                        
                        Inn = JSON.parse(JSON.stringify(In[i]))  
                        t.push("")
                        t.push("")
                      }
                  
                  }while(!In[i++])
                  if(Inn){
                      // console.log(Inn.time)
                      t.push(Inn.time)
                      var res = Inn.time.split(" : ");
                      var late = Number(res[0])+Number(res[1])/100.0
                      if(late > 8.30)
                        t.push("มาสาย")
                      else
                        t.push("มาตรงเวลา")

                  }else{
                      console.log("Empty")
                      t.push("ไม่มีข้อมูล")
                  }
                      
            }else{
              // console.log("not")
              
              t.push("ไม่มีข้อมูล")
            }



            if(InOut["outwork"]){
              var Out = JSON.parse(JSON.stringify(InOut["outwork"]))
              var Outt = ""
              var i = 0
              do{
                  if(Out[i]){
                    Outt = JSON.parse(JSON.stringify(Out[i]))  
                  }
                  

              }while(!Out[i++])
              if(Outt){
                  // console.log(Outt.time)
                  t.push(Outt.time)
                  

              }else{
                  // console.log("Empty")
                  t.push("ไม่มีข้อมูล")
              }
                  
          }else{
            // console.log("not")
            t.push("ไม่มีข้อมูล")
          }
          tmp.push(t)
          
        }
        

    });
    
  });
}

async function GetUser(){
  await GetWorking()

  
    await db.collection("user").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var data = JSON.parse(JSON.stringify(doc.data()))

        var i = 0
        ListOfUser.forEach(x=>{
          if(doc.id === x){
            
            tmp[i][0] = data.name
            tmp[i][1] = data.lastname
            
          }
          i++
        })
        
      })

      
    })
  
  
}

async function getLeave(){
  await db.collection("leave").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      var ListOfLeaveUser =[]
      var myJSON = JSON.parse(JSON.stringify(doc.data()));
      ListOfUser.push(doc.id)
      for (var key in myJSON) { 
        var tmp =[]
        
        var myLeave = JSON.parse(JSON.stringify(myJSON[key]));
        tmp.push(doc.id)
        if(myLeave.time_start){
          tmp.push(myLeave.title+"\n"+myLeave.time_start+" - "+myLeave.time_end)
        }else{
          tmp.push(myLeave.title)
        }
        
        var strDateLeave = myLeave.date_start.split("/")
        dateLeave = new Date(Number(strDateLeave[2])-543,strDateLeave[1]-1,strDateLeave[0])
        tmp.push(dateLeave)
        strDateLeave = myLeave.date_end.split("/")
        dateLeave = new Date(Number(strDateLeave[2])-543,strDateLeave[1]-1,strDateLeave[0])
        tmp.push(dateLeave)
      
        ListOfLeave.push(tmp)
      }
    })
  })
}

async function GetUserForLeave(){
 
  
  
    await db.collection("user").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var data = JSON.parse(JSON.stringify(doc.data()))

        
        if(data.name && data.lastname){
          var tm = []
          tm.push(data.name)
          tm.push(data.lastname)

          ListOfUserForLeve[doc.id] = tm
        }
        
          
        

        
      })

      
    })
  
  
}

function createTable(tmp) {
  if(tmp.length < 1){
    result_data = `<button class="collapsible" style="width: 80%;">ไม่มีข้อมูล</button>`
  }else{
    result_data = `<table class="table table-hover" style="width: 80%;">
          <th>
            
            <td style="font-size: x-large;" colspan="5">
            `+
              "วันนี้, "+date.toLocaleDateString('th-TH',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
              +`
            </td>
            
          </th>
          <tr style="background-color: #92a8d1;">
            <td>ชื่อ</td>
            <td>นามสกุล</td>
            <td>เวลาเข้างาน</td>
            <td>สถานะการเข้างาน</td>
            <td>เวลาออกงาน</td>
          </tr>`
    tmp.forEach(x=>{
      if(x[2]){

      
        result_data += "<tr>\n"
        x.forEach(y=>{
          result_data += "<td>\n"+y
          result_data += "</td>\n"
          
        })
        result_data += "</tr>\n"
      }
    })

    var strDateLeave = result.split(" ")
              var dateLeave = new Date(Number(strDateLeave[2])-543,monthNamesThai.indexOf(strDateLeave[1]),strDateLeave[0])
          
              ListOfLeave.forEach(dataLeave=>{
                    if(dateLeave.getTime() >= dataLeave[2].getTime() && dateLeave.getTime()<=dataLeave[3].getTime()){
                      result_data+=`<tr>
                                      <td >`+ListOfUserForLeve[dataLeave[0]][0]+`</td>
                                      <td >`+ListOfUserForLeve[dataLeave[0]][1]+`</td>
                                      <td >-</td>
                                      <td >`+dataLeave[1]+`</td>
                                      <td >-</td>
                                  </tr>`
                    }
                  })

    result_data += "</table>\n"

  }
}

async function main(){

  await GetUser()
  await GetUserForLeave()
  await getLeave()
  await createTable(tmp)
  
  // console.log(tmp)
}
