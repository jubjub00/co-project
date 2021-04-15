
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
            
            var dateLeave = new Date(Number(strDateLeave[2])-543,monthNamesThai.indexOf(strDateLeave[1]))
          
            tmp.push(dateLeave)
            
        }
    })
    var sortedActivities = tmp.sort((a, b) => b - a)
    ListOfDate = sortedActivities.map(function (date) { return date.getTime() }).filter(function (date, i, array) {
        return array.indexOf(date) === i;
    }).map(function (time) { return new Date(time) })
  })
}

async function GetAllWorking(){
    await db.collection("WorkingTime").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var myJSON = JSON.parse(JSON.stringify(doc.data()));
            var t = []
            //t['id'] = doc.id
            for (var key in myJSON) { 
              var tt=[]
              var strDateLeave = key.split(" ")
              var dateLeave = new Date(Number(strDateLeave[2])-543,monthNamesThai.indexOf(strDateLeave[1]))
              
              if(myJSON[key]['inwork']){
                
                tt.push(dateLeave)
                for (var inwork in myJSON[key]['inwork']) { 
                  var time = myJSON[key]['inwork'][inwork]['time']
                  
                  var tmp_ii = time.split(" : ")
                        if((Number(tmp_ii[0])+Number(tmp_ii[1])/100) > 8.30)
                          tt.push("มาสาย")
                        else
                          tt.push("มาตรงเวลา")
                  break
                }
              }
              
              if(tt.length != 0)
                t.push(tt)
            }

            var sortedActivities = t.sort((a, b) => b[0] - a[0])
            ListOfWorking[doc.id]=sortedActivities
        })
      })
}

async function getLeave(){
  await db.collection("leave").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      var myJSON = JSON.parse(JSON.stringify(doc.data()));
      
      for (var key in myJSON) { 
        var tmp =[]
        var strDateLeave = ''
        var myLeave = JSON.parse(JSON.stringify(myJSON[key]))
        tmp.push(myLeave.title)
        strDateLeave = myLeave.date_start.split("/")
        tmp.push(myLeave.date_start)
        tmp.push(myLeave.date_end)

        tmp.push(true)
        tmp.push(doc.id)
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
        
        dateX = str[0]+" "+str[1]
          
        
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
    await db.collection("user").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var data = JSON.parse(JSON.stringify(doc.data()))
        if(data.name && data.lastname){
          var tttm=[]
          tttm.push(doc.id)
          tttm.push(data.name)
          tttm.push(data.lastname)
          if(data.id_img){
          var c = "firebasestorage.googleapis.com/v0/b/workingtimecheck.appspot.com/o/user%2F"+data.id_img[0]+"?alt=media&token=1ab5dd93-554c-4a35-a3a5-4c29e15ebfcd"
          var g = `<div type="button" class="btn btn-info" onclick="window.open('https://`+c+`', '_blank' )">ดูรูปภาพ</div>`
          tttm.push(g)
          }else{
            tttm.push("<div type='button' class='btn btn-info'>ไม่มีรูปภาพ</div>")
          }
          ListOfUser.push(tttm)
        }

      })
    })
    
}

function createTable() {

    result_data = `<table class="table table-hover" style="width: 80%;" >`
    
    ListOfUser.forEach(xx=>{
            
            result_data+=`<tr><td> <button class="collapsible">`+xx[1]+" "+xx[2]+" "+xx[3]+`</button><div class="content">`
            var sum_all = 0
            var sum_intime = 0
            var sum_outtime = 0
            var sum_l1 = 0
            var sum_l2 = 0
            var sum_l3 = 0
            var sum_l4 = 0
            ListOfDate.forEach(x=>{
              

              result_data+=x.toLocaleDateString('th-TH',{year:'numeric',month:'long'})
            result_data+=`
            <table class="table">
              <tr>
                  
                  <td >วันทำงาน</td>
                  <td >เข้าตรงเวลา</td>
                  <td >มาสาย</td>
              </tr>`
              
              
                result_data+=`<tr>`
                //console.log(ListOfHistory[j]['emp'])
                var count_all = 0
                if(ListOfWorking[xx[0]])
                ListOfWorking[xx[0]].forEach(in_time=>{
                    

                    if(x.getTime() === in_time[0].getTime()){
                      
                      count_all++
                    }
                  })
                sum_all += count_all
                
                result_data+=`<td>`+count_all+`</td>`
                  
                

                result_data+=`<td>`
                  var intime=0
                  var outtime=0
                  if(ListOfWorking[xx[0]])
                  ListOfWorking[xx[0]].forEach(in_time=>{
                    

                    if(x.getTime() === in_time[0].getTime()){
                      if(in_time[1] === "มาตรงเวลา"){
                        intime++
                      }else if(in_time[1] === "มาสาย"){
                        outtime++
                      }

                    }
                  })
                  sum_intime += intime
                  result_data+=intime
                result_data+=`</td>`

                sum_outtime += outtime
                result_data+=`<td>`+outtime+`</td>`

                  
            
                result_data+=`</tr>`

                result_data+=`</table>`


                result_data+=`
                <table class="table">
                  <tr>
                      
                      <td >ลากิจ</td>
                      <td >ลาป่วย</td>
                      <td >ลาพักร้อน</td>
                      <td >ลาคลอด</td>
                  </tr>`

                  result_data+=`<tr>`

                  var l1=0
                  var l2=0
                  var l3=0
                  var l4=0 
                  
                    for(var i=0;i<ListOfLeave.length;i++){
                    
                    
                    var strDateLeave = ListOfLeave[i][1].split("/")
                    var dateLeave2 = new Date(Number(strDateLeave[2])-543,Number(strDateLeave[1]-1),Number(strDateLeave[0]))

                    var strDateLeave = ListOfLeave[i][2].split("/")
                    var dateLeave3 = new Date(Number(strDateLeave[2])-543,Number(strDateLeave[1]-1),Number(strDateLeave[0]))


                    var e = dateLeave2
                    var ee = dateLeave3
                  for ( var d = e; d.getTime() <= ee.getTime(); d.setDate(d.getDate() + 1)){

                  
                     
                      if(x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear() && xx[0] === ListOfLeave[i][4]){
                        
                        if(ListOfLeave[i][0] === "ลากิจ"){
                          l1++
                        }else if(ListOfLeave[i][0] === "ลาป่วย"){
                          l2++
                        }else if(ListOfLeave[i][0] === "ลาพักร้อน"){
                          l3++
                        }else if(ListOfLeave[i][0] === "ลาคลอด"){
                          l4++
                        }

                      }
                      
                  }
                  }//)

                result_data+=`<td>`+l1+`</td>`
                result_data+=`<td>`+l2+`</td>`
                result_data+=`<td>`+l3+`</td>`
                result_data+=`<td>`+l4+`</td>`
                sum_l1 += l1
                sum_l2 += l2
                sum_l3 += l3
                sum_l4 += l4
                  
                result_data+=`</tr>`

                result_data+=`</table>`
                
              })

                result_data+=`รวม<table class="table"><tr>
                                  <td >`+sum_all+`</td>
                                  <td >`+sum_intime+`</td>
                                  <td >`+sum_outtime+`</td>
                              </tr></table>`
                result_data+=`รวม<table class="table"><tr>
                                  <td >`+sum_l1+`</td>
                                  <td >`+sum_l2+`</td>
                                  <td >`+sum_l3+`</td>
                                  <td >`+sum_l4+`</td>
                              </tr></table>`

            result_data+=`</div></td></tr>`
          
          
    })
    
    result_data += `</table>`
    // console.log(ListOfLeave)
}
    
async function main(){
  await getLeave()
  await GetAllDate()
  await GetAllWorking()
  await GetUser()
  // await getLeave()
  // GetWorkingEachDate()
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
