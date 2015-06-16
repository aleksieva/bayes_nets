describe("Init", function() {
  // beforeAll(function() {
  //   loadDefaultNetwork("files/smokerBronchitis.json", true);
  // });

  it("should access correct height, radius, pressed key values", function() {
    expect(height).toBeDefined();
    expect(height).not.toBeNull();
  });

  it("should access correct radius", function() {
    expect(radius).toBeDefined();
    expect(radius).toEqual(20);    
  }); 

  it("pressedKey should have correct initial value", function() {
    expect(pressedKey).toBeDefined();
    expect(pressedKey).toEqual(-1);
  });

  it("should have correct constants", function(){
    expect(constants.BACKSPACE).toEqual(8);
    expect(constants.DELETE).toEqual(46);
    expect(constants.ENTER).toEqual(13);
  });

  it("mousedown variables should be initially null", function(){
    expect(selectedNode).toBeNull();
    expect(selectedPath).toBeNull();
    expect(mousedownNode).toBeNull();    
  });

  it("should be set to default mode", function(){
    expect(defaultMode).toBeTruthy();
    expect(nodeMode).toBeFalsy();
    expect(connMode).toBeFalsy();
    expect(editNodeTextMode).toBeFalsy();
    expect(editNodeMode).toBeFalsy();
    expect(sampleMode).toBeFalsy();
  })

  it("should have svg setup", function() {
     expect(svg).toBeDefined();
     expect(svg).not.toBeNull();
  });

  it("should have nodes and edges defined", function() {
    expect(nodes).toBeDefined();
    expect(edges).toBeDefined();
    expect(graph).toBeDefined();
    expect(paths).toBeDefined();
    expect(circles).toBeDefined();
  });

  it("should have initiated with refresh()", function() {
    expect(refresh).toBeDefined(); 
  });

  describe("Node", function() {
    beforeAll(function() {
      nodeMode = true;
    });
    it("should have nodes defined", function(){
      expect(nodes).toBeDefined();
    });
    it("should have lastID to equal id of the last node", function(){
      //not working  
      console.log(lastID);
      expect(lastID).toEqual(nodes[nodes.length-1].id);
    })
    it("should be able to create a node", function() {
      expect(nodes[nodes.length-1].title).toEqual("MaryCalls");
      addNewNode(true);
      expect(nodes[nodes.length-1].title).toEqual("New Node");
      expect(lastID).toEqual(nodes[nodes.length-1].id);
    });
    it("should be able to delete a node", function() {
      deleteNode(nodes[nodes.length-1]);
      expect(nodes[nodes.length-1].title).toEqual("MaryCalls");
    })
  });

  describe("Edge", function() {
    beforeAll(function() {
      connMode = true;
    });

    it("should have edges defined", function() {
      expect(edges).toBeDefined();
    });
    it("should have correct number of edges", function() {
      expect(edges.length).toEqual(4);
    });
    it("should be able to delete an edge", function() {
      deleteEdge(edges[edges.length-1]);
      expect(edges.length).toEqual(3);
    });     
    it("should be able to create an edge", function() {
      var alarm = nodes.filter(function(node) {
        return node.title === "Alarm";
      })[0];
      var mary = nodes.filter(function(node) {
        return node.title === "MaryCalls";
      })[0];
      createNewEdge(alarm, mary);
      expect(edges.length).toEqual(4);
    });   
  })

  describe("Delete Network", function() {
    beforeAll(function() {
      deleteNetwork(false);
    });
    it("there should be no nodes", function() {
      expect(nodes).toEqual([]);
    });
    it("there should be no edges", function() {
      expect(edges).toEqual([]);
    })   
  });
});