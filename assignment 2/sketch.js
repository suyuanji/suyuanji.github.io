
var particleSystem = [];
var attractors = [];
var table;
var aggregated = [];
var cCategory = [];
var connections = [];
var investors = [];
//var categories = [];
//var table2;

function preload(){
    table = loadTable("data/investments.csv", "csv", "header");
    table2 = loadTable("data/companies_categories.csv", "csv","header");
}


function setup(){
    var canvas = createCanvas(windowWidth, windowHeight);
    frameRate(30);
    
    colorMode(HSB, 360, 100, 100, 100);
    background(0);
    textSize(10);
    textAlign(CENTER);
    textStyle(BOLD);
    
    //print(table.getRowCount() + " total rows in table");
    
    /* replace \, by ""
    aggregates usd amounts per company invested 
    by using the object aggregated  */
    for (var r = 0; r < table.getRowCount(); r++){
        var cname = table.getString(r, "company_name");
        var invested = table.getString(r, "amount_usd");
        var investorname = table.getString(r,"investor_name")
        invested = parseInt(invested);
        if(!isNaN(invested)){
            if(aggregated.hasOwnProperty(cname)){
                aggregated[cname]=aggregated[cname]+invested;
            }else{
                aggregated[cname] = invested;
            }
        }  

    }
    
        for (var r = 0; r < table2.getRowCount(); r++){
        var cname = table2.getString(r, "name");
        var category = table2.getString(r, "category_code");
            if(category){
                cCategory[cname]=category;
            }else{
                cCategory[cname] = 0;
            }
        }  
    
    
    /* converts the object into an array of companies */
    var aAggregated = []; 
    var aAggregatedInvestor = [];
    
    Object.keys(aggregated).forEach(function(name){
        var company = {};
        company.name = name;
        company.sum = aggregated[name]
        aAggregated.push(company);
    });
    
    Object.keys(cCategory).forEach(function(name){
        var investor = {};
       investor.name = name;
        investor.category = cCategory[name];
        aAggregatedInvestor.push(investor);
    });
    /* sorts the array by usd amount */
    aAggregated.sort(function(companyA, companyB){      
        return companyB.sum - companyA.sum;
    });
    
    print(aAggregatedInvestor);
    
    
    aAggregated = aAggregated.slice(0,100);
    
     for (var r = 0; r < table2.getRowCount(); r++){
        var cname = table2.getString(r, "name");
        var category = table2.getString(r, "category_code");
        
         
         var foundCompany = aAggregatedInvestor.find(function(element){
             return element.name == cname;
         });
         
         if(foundCompany){
             
            var foundInvestor = aAggregated.find(function(element){
                return element.name == cname;
            });
             
             if(foundInvestor){
                 var connection = {};
                 connection.investor = foundCompany;
                 connection.amount = foundInvestor;
                 connections.push(connection);
             }
    
         }
         
        }
    print(connections);
    
    /* prints the top company */
    print(aAggregated[0].name + " : " +aAggregated[0].sum);
     print(aAggregatedInvestor[0].name);
    
    /* creates 100 particles from the array */
    for(var i=0; i<connections.length; i++){
        var p = new Particle(connections[i].amount.name,connections[i].amount.sum,connections[i].investor.category);
        particleSystem.push(p);
        //print(p);
    }
    
    var ob ={};
    for(var i=0; i<table2.getRowCount(); i++){
        var catName = table2.getString(i,"category_code");
        if(ob.hasOwnProperty(catName)){
            ob[catName]++;
        }else{
            ob[catName]=1;
        }
    };
    
    Object.keys(ob).forEach(function(catName){
        print(catName + ","+ob[catName]); 
    });

    
    
    /* creates a central atractor of strength 1 */
    var at = new Attractor(createVector(width/2, height/2), 1);
    attractors.push(at);
}


function draw(){
    background(0);    
    
    /*checks for pairs of particles*/
    for(var STEPS = 0; STEPS<4; STEPS++){
        for(var i=0; i<particleSystem.length-1; i++){
            for(var j=i+1; j<particleSystem.length; j++){
                var pa = particleSystem[i];
                var pb = particleSystem[j];
                var ab = p5.Vector.sub(pb.pos, pa.pos);
                var distSq = ab.magSq();
                if(distSq <= sq(pa.radius + pb.radius)){
                    var dist = sqrt(distSq);
                    var overlap = (pa.radius + pb.radius) - dist;
                    ab.div(dist); //ab.normalize();
                    ab.mult(overlap*0.5);
                    pb.pos.add(ab);
                    ab.mult(-1);
                    pa.pos.add(ab);
                    
                    pa.vel.mult(0.97);
                    pb.vel.mult(0.97);

                }
            }
        }
    }
    
    

    for(var i=particleSystem.length-1; i>=0; i--){
        var p = particleSystem[i];
        p.update();
        p.draw();
    }
}



var Particle = function(name, sum,category){
    this.name = name;
    this.sum = sum;
    
    this.category = category;
    var h;
    
    if(this.category == "social"){
        h = 100;
    }else{
        h =300;
    }

    this.radius = sqrt(sum)/4000;
    var initialRadius = this.radius;
    
    var isMouseOver = false;
    var maximumRadius = 70;
    
    var tempAng = random(TWO_PI);
    this.pos = createVector(cos(tempAng), sin(tempAng));
    this.pos.div(this.radius);
    this.pos.mult(1000);
    this.pos.set(this.pos.x + width/2, this.pos.y + height/2);
    this.vel = createVector(0, 0);
    var acc = createVector(0, 0);
    
    var rowCat = table2.findRow(this.name,"name");
    
    if(rowCat != null){
        this.categoryName = rowCat.get("category_code");
    }else{
        this.categoryName = "other";
        
    }
    
    switch(this.categoryName){
            case"software" :
                this.color = {h: 0, s: 99, b: 99};
                break;
            case"web" :
                this.color = {h: 300, s: 100, b: 74};
                break;
            case"biotech" :
                this.color = {h: 190, s: 75, b: 90};
                break;
            case"mobile" :
                this.color = {h: 160, s: 54, b: 91};
                break;
            case"enterprise" :
                this.color = {h: 100, s: 90, b: 59};
                break;
            case"ecommerce" :
                this.color = {h: 53, s: 33, b: 98};
                break;
            default:
                this.color = {h: 255, s: 300, b: 99};
            
            
    }
    this.update = function(){
        checkMouse(this);
        
        attractors.forEach(function(A){
            var att = p5.Vector.sub(A.pos, this.pos);
            var distanceSq = att.magSq();
            if(distanceSq > 1){
                att.normalize();
                att.div(10);
                //att.mult(this.radius*this.radius/200);
                acc.add(att);
            }
        }, this);
        this.vel.add(acc);
        this.pos.add(this.vel);
        acc.mult(0);   
    }  
    
    this.draw = function(){
        noStroke();
        if(isMouseOver){
            fill(100, 100, 50);
        }else{
            fill(0, 0, 50); 
        }
        
        fill(this.color.h, this.color.s, this.color.b);

        ellipse(this.pos.x, 
                this.pos.y,
                this.radius*2,
                this.radius*2);  
        
        if(this.radius == maximumRadius){
            fill(0, 0, 100);
            text(this.name, this.pos.x, this.pos.y+5);
            text(this.sum, this.pos.x, this.pos.y+20);
            text(this.categoryName,this.pos.x, this.pos.y+40);
        }
    }
    
    function checkMouse(instance){
        var mousePos = createVector(mouseX, mouseY);
        if(mousePos.dist(instance.pos) <= instance.radius){
            incRadius(instance);
            isMouseOver = true;
        } else{
            decRadius(instance);
            isMouseOver = false;
        }
    }
    
    function incRadius(instance){
        instance.radius+=4;
        if(instance.radius > maximumRadius){
            instance.radius = maximumRadius;
        }  
    }
    
    function decRadius(instance){
        instance.radius-=4;
        if(instance.radius < initialRadius){
            instance.radius = initialRadius;
        }
    }
    
}

var Attractor = function(pos_, s){
    this.pos = pos_.copy();
    var strength = s;
    this.draw = function(){
        noStroke();
        fill(0, 100, 100);
        ellipse(this.pos.x, this.pos.y,             
                strength, strength);
    } 
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);

}

var Particles = function(name,sum,category){
    this.name = name;
    this.sum = sum;
}
