(function configureEzoDemo(){
  "use strict";

  const form=document.getElementById("ezoDemoForm");
  if(!form)return;

  const task=document.getElementById("demoTask");
  const priority=document.getElementById("demoPriority");
  const priorityValue=document.getElementById("priorityValue");
  const risk=document.getElementById("demoRisk");
  const region=document.getElementById("demoRegion");
  const status=document.getElementById("demoStatus");
  const winner=document.getElementById("demoWinner");
  const reason=document.getElementById("demoReason");
  const scoresRoot=document.getElementById("demoScores");
  const json=document.getElementById("demoJson");
  const output=document.querySelector(".demo-output");

  const names=["Alpha","Beta","Gamma","Delta"];

  priority.addEventListener("input",()=>{priorityValue.textContent=priority.value;});

  function hashString(value){
    let h=2166136261;
    for(let i=0;i<value.length;i++){
      h^=value.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return h>>>0;
  }

  function normalize(values){
    const total=values.reduce((a,b)=>a+b,0);
    const raw=values.map(v=>Math.max(1,Math.round(v/total*100)));
    let diff=100-raw.reduce((a,b)=>a+b,0);
    let i=0;
    while(diff!==0){
      const idx=i%raw.length;
      if(diff>0){raw[idx]++;diff--;}
      else if(raw[idx]>1){raw[idx]--;diff++;}
      i++;
    }
    return raw;
  }

  function compute(){
    const p=Number(priority.value);
    const seed=`${task.value}|${p}|${risk.value}|${region.value}`;
    const h=hashString(seed);

    const base=[
      35+((h>>>0)&31),
      35+((h>>>5)&31),
      35+((h>>>10)&31),
      35+((h>>>15)&31)
    ];

    if(task.value==="ai"){base[0]+=18;base[2]+=8;}
    if(task.value==="payment"){base[1]+=20;base[3]+=7;}
    if(task.value==="workflow"){base[2]+=20;base[0]+=6;}
    if(risk.value==="high"){base[3]+=18;base[1]+=5;}
    if(risk.value==="low"){base[0]+=8;}
    if(region.value==="eu"){base[1]+=9;}
    if(region.value==="local"){base[2]+=11;}
    if(region.value==="global"){base[3]+=9;}
    base[(p-1)%4]+=p*2;

    const scores=normalize(base);
    const max=Math.max(...scores);
    const selected=scores.indexOf(max);

    const taskLabel={ai:"AI / agent",payment:"Payment / API",workflow:"Workflow"}[task.value];
    const riskLabel={low:"alacsony",medium:"közepes",high:"magas"}[risk.value];
    const regionLabel={eu:"EU",global:"globális",local:"helyi"}[region.value];

    return {
      input:{task:taskLabel,priority:p,risk:riskLabel,environment:regionLabel},
      selected_endpoint:`0${selected+1} · ${names[selected]}`,
      scores:Object.fromEntries(names.map((name,i)=>[name,scores[i]])),
      deterministic_key:h.toString(16).padStart(8,"0")
    };
  }

  function render(result){
    const values=Object.values(result.scores);
    const rows=scoresRoot.querySelectorAll(".score-row");
    rows.forEach((row,i)=>{
      row.querySelector("i").style.width=values[i]+"%";
      row.querySelector("strong").textContent=values[i]+"%";
    });

    winner.textContent=result.selected_endpoint;
    reason.textContent=`A szemléltető szabályprofil ezt a végpontot adta a legmagasabb súllyal. Determinisztikus kulcs: ${result.deterministic_key}.`;
    json.textContent=JSON.stringify(result,null,2);
    status.textContent="Döntés elkészült";
    output.classList.remove("flash");
    void output.offsetWidth;
    output.classList.add("flash");
  }

  form.addEventListener("submit",function(event){
    event.preventDefault();
    const statusWrap=status.closest(".demo-status");
    statusWrap.classList.add("running");
    status.textContent="Ézó1 értékelés…";
    window.setTimeout(()=>{
      render(compute());
      statusWrap.classList.remove("running");
    },260);
  });
})();