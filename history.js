
var db = firebase.firestore()
var monthNamesThai = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]
const date = new Date()
const result = date.toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'})
let result_data = ''
var ListOfWorking = []
var ListOfHistory =[]
var ListOfDate =[]
var ListOfUser =[]
var ListOfLeave = []
async function GetAllDate(){
  
  await db.collection("WorkingTime").get().then((querySnapshot) => {
    var tmp =[]
    querySnapshot.forEach((doc) => {
        var myJSON = JSON.parse(JSON.stringify(doc.data()));
        for (var key in myJSON) {
            var strDateLeave = key.split(" ")
            
            var dateLeave = new Date(Number(strDateLeave[2])-543,monthNamesThai.indexOf(strDateLeave[1]),strDateLeave[0])
          
            tmp.push(dateLeave)
            
        }
    });


    var sortedActivities = tmp.sort((a, b) => b - a)
    ListOfDate = sortedActivities.map(function (date) { return date.getTime() }).filter(function (date, i, array) {
        return array.indexOf(date) === i;
    }).map(function (time) { return new Date(time); })
    
    
    
  });
}

async function GetAllWorking(){
    await db.collection("WorkingTime").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var myJSON = JSON.parse(JSON.stringify(doc.data()));
            var t = []
            t['id'] = doc.id
            t['data'] = myJSON
            ListOfWorking.push(t)
        });
      });
}

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
        //tmp.push(dateLeave)
        var myLeave = JSON.parse(JSON.stringify(myJSON[key]));
        tmp.push(doc.id)
        if(myLeave.time_start){
          tmp.push(myLeave.title+"\n"+myLeave.time_start+" - "+myLeave.time_end)
        }else{
          tmp.push(myLeave.title)
        }
        
        strDateLeave = myLeave.date_start.split("/")
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


function GetWorkingEachDate(){
    ListOfDate.forEach(x=>{
        var tmpHistory = []
        var dateX = x.toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'})
        var str = dateX.split(" ")
        if(str[0].length == 1){
            dateX = "0"+str[0]+" "+str[1]+" "+str[2]
          }else if(str[0].length == 2){
            dateX = str[0]+" "+str[1]+" "+str[2]
          }
        
        tmpHistory['date']=dateX

        var listEmpWorking = []
        var listEmpWorking2 = []
        var listEmpWorkingDetail = []
        var listEmpWorkingDetail2 = []


        ListOfWorking.forEach(y=>{
            
            

            try {
                if(y['data'][dateX]['inwork']){
                    var datainwork = y['data'][dateX]['inwork']
                    listEmpWorking.push(y['id'])
                        var listinwork = []
                        for (var key in datainwork) { 
                          //console.log(key)
                            //if(datainwork[key]['time']){
                              listinwork.push([datainwork[key]['time'],datainwork[key]['latitude'],datainwork[key]['longtitude']])
                           
                            //}
                            
                        
                        }
                       
                        listEmpWorkingDetail[y['id']]= listinwork
                        
                    
                }
                if(y['data'][dateX]['outwork']){
                  var datainwork = y['data'][dateX]['outwork']
                  listEmpWorking2.push(y['id'])
                  var listinwork = []
                  for (var key in datainwork) { 
                    //console.log(key)
                      //if(datainwork[key]['time']){
                        listinwork.push([datainwork[key]['time'],datainwork[key]['latitude'],datainwork[key]['longtitude']])
                     
                      //}
                      
                  
                  }
                 
                  listEmpWorkingDetail2[y['id']]= listinwork
                }
            }catch (error) {}

            
            
        })
        tmpHistory['empInwork']=listEmpWorking
        tmpHistory['empOutwork']=listEmpWorking2
        tmpHistory['inwork']=listEmpWorkingDetail
        tmpHistory['outwork']=listEmpWorkingDetail2

        ListOfHistory.push(tmpHistory)
        
    })


    


}


async function GetUser(){
  await GetAllDate()
  
  
    await db.collection("user").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var data = JSON.parse(JSON.stringify(doc.data()))

        
        if(data.name && data.lastname){
          ListOfUser[doc.id]=data.name+" "+data.lastname
        }
        
          
        

        
      })

      
    })
  
  
}

function createTable() {

    result_data = `<table class="table table-hover" style="width: 80%;" >`
    if(ListOfHistory.length > 0){
    
          for(var j=0;j<ListOfHistory.length;j++){
            result_data+=`<tr><td> <button class="collapsible">`+ListOfHistory[j]['date']+`</button><div class="content">`
            

            result_data+=`
            <table class="table">
              <tr>
                  <td >ชื่อ-นามสกุล</td>
                  <td >เวลาเข้า</td>
                  <td >พิกัดที่เข้างาน</td>
                  <td >เวลาออก</td>
                  <td >พิกัดที่ออกงาน</td>
                  <td >สถานะ</td>
              </tr>`
            
              ListOfHistory[j]['empInwork'].forEach(x=>{
                result_data+=`<tr>`
                //console.log(ListOfHistory[j]['emp'])
                result_data+=`<td>`+ListOfUser[x]+`</td>`

                result_data+=`<td>`
                  if(ListOfHistory[j]['inwork'][x]){
                    ListOfHistory[j]['inwork'][x].forEach(function(ii, idx, array){
                      if (idx === array.length - 1)
                        result_data+=ii[0]
                      else
                        result_data+=ii[0]+" , "
                    })
                  }
                result_data+=`</td>`

                result_data+=`<td>`

                  if(ListOfHistory[j]['inwork'][x]){
                    ListOfHistory[j]['inwork'][x].forEach(function(ii, idx, array){
                      
                          
                      url = "www.google.co.th/maps/@"+ ii[1]+","+ii[2] +",20z"
                      result_data+=` <button type="button" class="btn btn-info" onclick="window.open('https://`+url+`', '_blank' )">ตำแหน่ง`+(idx+1)+`</button>`
                          
                    })

                  }
                result_data+=`</td>`


                result_data+=`<td>`

                  if(ListOfHistory[j]['outwork'][x]){
                      ListOfHistory[j]['outwork'][x].forEach(function(ii, idx, array){
                      if (idx === array.length - 1)
                        result_data+=ii[0]
                      else
                        result_data+=ii[0]+" , "
                    })
                  }
                  
                result_data+=`</td>`

                result_data+=`<td>`

                  if(ListOfHistory[j]['outwork'][x]){
                    ListOfHistory[j]['outwork'][x].forEach(function(ii, idx, array){
                      
                          
                      url = "www.google.co.th/maps/@"+ ii[1]+","+ii[2] +",20z"
                      result_data+=` <button type="button" class="btn btn-info" onclick="window.open('https://`+url+`', '_blank' )">ตำแหน่ง`+(idx+1)+`</button>`
                          
                    })

                  }
                result_data+=`</td>`

                result_data+=`<td>`
                  if(ListOfHistory[j]['inwork'][x]){
                    ListOfHistory[j]['inwork'][x].forEach(function(ii, idx, array){
                      if (idx === array.length - 1){
                        var tmp_ii = ii[0].split(" : ")
                        if((Number(tmp_ii[0])+Number(tmp_ii[1])/100) > 8.30)
                          result_data+="มาสาย"
                        else
                          result_data+="มาตรงเวลา"
                      }
                      else{
                        var tmp_ii = Number(ii[0].split(" : "))
                        if((Number(tmp_ii[0])+Number(tmp_ii[1])/100) > 8.30)
                          result_data+="มาสาย ,"
                        else
                          result_data+="มาตรงเวลา ,"
                      }
                    })
                  }
                result_data+=`</td>`
                
                
              
                result_data+=`</tr>`
                  

                  
                
              })

              var strDateLeave = ListOfHistory[j]['date'].split(" ")
              var dateLeave = new Date(Number(strDateLeave[2])-543,monthNamesThai.indexOf(strDateLeave[1]),strDateLeave[0])
          
              ListOfLeave.forEach(dataLeave=>{
                    if(dateLeave.getTime() >= dataLeave[2].getTime() && dateLeave.getTime()<=dataLeave[3].getTime()){
                      result_data+=`<tr>
                                      <td >`+ListOfUser[dataLeave[0]]+`</td>
                                      <td >-</td>
                                      <td >-</td>
                                      <td >-</td>
                                      <td >-</td>
                                      <td >`+dataLeave[1]+`</td>
                                  </tr>`
                    }
                  })
            
            
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
  await GetAllDate()
  await GetAllWorking()
  await GetUser()
  await getLeave()
  GetWorkingEachDate()
  await createTable()
  // console.log(ListOfLeave)
}

async function searchByDate(dayStart,dayEnd) {
  
  ListOfHistory = []
  ListOfDate.forEach(x=>{
    if(x.getTime() >= dayStart.getTime() && x.getTime()<=dayEnd.getTime()){
    
    
      var tmpHistory = []
      var dateX = x.toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'})
      var str = dateX.split(" ")
      if(str[0].length == 1){
          dateX = "0"+str[0]+" "+str[1]+" "+str[2]
        }else if(str[0].length == 2){
          dateX = str[0]+" "+str[1]+" "+str[2]
        }
      
      tmpHistory['date']=dateX

      var listEmpWorking = []
      var listEmpWorking2 = []
      var listEmpWorkingDetail = []
      var listEmpWorkingDetail2 = []


      ListOfWorking.forEach(y=>{
          
          

          try {
              if(y['data'][dateX]['inwork']){
                  var datainwork = y['data'][dateX]['inwork']
                  listEmpWorking.push(y['id'])
                      var listinwork = []
                      for (var key in datainwork) { 
                        //console.log(key)
                          //if(datainwork[key]['time']){
                            listinwork.push([datainwork[key]['time'],datainwork[key]['latitude'],datainwork[key]['longtitude']])
                        
                          //}
                          
                      
                      }
                    
                      listEmpWorkingDetail[y['id']]= listinwork
                      
                  
              }
              if(y['data'][dateX]['outwork']){
                var datainwork = y['data'][dateX]['outwork']
                listEmpWorking2.push(y['id'])
                var listinwork = []
                for (var key in datainwork) { 
                  //console.log(key)
                    //if(datainwork[key]['time']){
                      listinwork.push([datainwork[key]['time'],datainwork[key]['latitude'],datainwork[key]['longtitude']])
                  
                    //}
                    
                
                }
              
                listEmpWorkingDetail2[y['id']]= listinwork
              }
          }catch (error) {}

          
          
      })
      tmpHistory['empInwork']=listEmpWorking
      tmpHistory['empOutwork']=listEmpWorking2
      tmpHistory['inwork']=listEmpWorkingDetail
      tmpHistory['outwork']=listEmpWorkingDetail2

      ListOfHistory.push(tmpHistory)
  }
})

await createTable()

}
