var startTour = function() {
 
    var tour = new Tour({
        //TODO change to local storage??
        storage : false,
        onStart : function(tour) {
          loadDefaultNetwork("files/nets/burglaryNet.json", true);
        }     
    });
 
    tour.addSteps([
      {
        element: ".tour-step.tour-step-zero",
        placement: "bottom",
        orphan: true,
        backdrop:true ,
        title: "Welcome to the Bayesian Networks tutorial!",
        content: "This tour will guide you through the main features of the tool."
      },
      {
        element: ".tour-step.tour-step-two",
        placement: "bottom",
        title: "Controls",
        content: "Use the dropdown menus to upload/download data, sample, learn structures and learn more about the tool itself."
      },
      {
        element: ".tour-step.tour-step-two-one",
        placement: "left",
        title: "Controls",
        content: "The text here shows the current dataset loaded in the tool."
      },      
      {
        element: ".tour-step.tour-step-three",
        placement: "top",
        title: "Canvas",
        content: "Use the canvas to add and delete elements. Click on the created elements to edit their properties."
      },
      {
        element: ".tour-step.tour-step-four",
        placement: "left",
        title: "Information box",
        content: "Use the information box to edit nodes' properties and get hints on how to control the tool."
      },
      {
        element: ".tour-step.tour-step-zoom",
        placement: "top",
        title: "Zooming Scale",
        content: "The zooming scale indicator shows if the user has zoomed in or out on the canvas. The zoom in/out limits are 0.5 - 2.0.",
        reflex: true,
        onShow: function(tour) {
          d3.select("#zoom-scale")
            .classed("tour-step tour-step-zoom", true);
        },                        
      },
      {
        element: ".tour-step.tour-step-six",
        placement: "right",
        title: "Adding a Node",
        content: "Double-click to add a node on the field.",
        // reflex: true,
        // onShown: function(tour) {
        //   $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        // },              
      },     
      {
        element: ".tour-step.tour-step-seven",
        placement: "left",
        title: "Renaming a Node",
        content: "Click on the label to change the node's title. Change the title to 'MaryCalls'",
        onShow: function(tour) {
          // check if node has been created and if not create it
          var selection = d3.select("h3.node-label");
          if (selection && selection[0][0].innerHTML === "New Node") {
            selection.classed("tour-step tour-step-seven", true);
          }
        },                        
      },
      {
        element: ".tour-step.tour-step-eight",
        placement: "top",
        title: "Adding a Link",
        content: "Click on the 'Alarm' node to select it.",
        reflex:true,
        onShow: function(tour) {
          var selection = d3.selectAll("g.node");
          selection.filter(function(d, i) {return d.title === "Alarm"})
                   .classed("tour-step tour-step-eight", true);
        },
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },                                 
      },     
      {
        element: ".tour-step.tour-step-eight",
        placement: "top",
        title: "Adding Link",
        content: "Drag from the 'Alarm' node to 'MaryCalls' node to add a connection between them.",
        onPrev: function(tour) {
          // setMode("");
        }                      
      },
      {
        element: ".tour-step.tour-step-nine",
        placement: "top",
        title: "Editing Node",
        content: "Click on the 'MaryCalls' node to edit its properties.",
        reflex: true,
        onShow: function(tour) {
          selectedNode = null;
          var selection = d3.selectAll("g.node")[0][d3.selectAll("g.node")[0].length-1];
          d3.select(selection).classed("tour-step tour-step-nine", true);
        },
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },
        onPrev: function(tour) {
          // setMode("");
        }                           
      },
      {
        element: ".tour-step.tour-step-ten",
        placement: "left",
        title: "Explore Node Properties",
        content: "Choose 'Node Values' from the dropdown to explore this node values.",
        onShow: function(tour) {
          d3.select("#node-options")
            .classed("tour-step tour-step-ten", true);
        },              
      },
      {
        element: ".tour-step.tour-step-ten",
        placement: "left",
        title: "Explore Node Properties",
        content: "Go back to CPT table.",
        onShow: function(tour) {
          d3.select("#node-options")
            .classed("tour-step tour-step-ten", true);
        },              
      },
      {
        element: ".tour-step.tour-step-eleven",
        placement: "left",
        title: "Explore Node Properties",
        content: "Edit the CPT values for 'MaryCalls' to being <0.7, 0.3>, <0.01, 0.99>.",
        onShow: function(tour) {
          d3.select(".cpt-table")
            .classed("tour-step tour-step-eleven", true);
        },              
      },
      {
        element: ".tour-step.tour-step-twelve",
        placement: "left",
        title: "Explore Node Properties",
        content: "Click 'Save Changes' button to save the update.",
        reflex: true,
        onShow: function(tour) {
          d3.select("#save-changes-btn")
            .classed("tour-step tour-step-twelve", true);
        },
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },               
      },
      {
        element: ".tour-step.tour-step-success",
        placement: "left",
        title: "Explore Node Properties",
        content: "Message on the result of your update.",
        onShow: function(tour) {
          d3.select(".alert-text")
            .classed("tour-step tour-step-success", true);
        },               
      },
      {
        element: ".tour-step.tour-step-dropdown",
        placement: "bottom",
        backdrop:true ,
        title: "Sampling",
        content: "Click the dropdown menu and select 'Sample from Network' to start sampling."
      },                 
      // {
      //   element: ".tour-step.tour-step-thirteen",
      //   placement: "right",
      //   backdrop:true,
      //   title: "Sampling from Network",
      //   content: "Click to start sampling from the network.",
      //   reflex: true,
      //   onShown: function(tour) {
      //     $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
      //   },
      //   onPrev: function(tour) {
      //     // if(!editNodeMode) {
      //     //   setMode("edit");
      //     // }
      //   }                        
      // },
      {
        element: ".tour-step.tour-step-fourteen",
        placement: "left",
        title: "Sampling from Network",
        content: "To use the sampling as a classifier, fix all the values except one.",
        onShow: function(tour) {
          d3.select("#fixed-sampling-div")
            .classed("tour-step tour-step-fourteen", true);
        },
        onPrev: function(tour) {
          setMode("");
        }               
      },
      {
        element: ".tour-step.tour-step-fifteen",
        placement: "bottom",
        title: "Sampling from Network",
        content: "Choose number of samples and click 'Run' to sample.",
        reflex: true,
        onShow: function(tour) {
          d3.select("#runSamplingBtn")
            .classed("tour-step tour-step-fifteen", true);
        },         
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },              
      },
      {
        element: ".tour-step.tour-step-sixteen",
        placement: "left",
        title: "Sampling from Network",
        content: "Click 'Resample' button to generate a different sample with the same size.",
        onShow: function(tour) {
          d3.select("#resample")
            .classed("tour-step tour-step-sixteen", true);
        },                     
      },      
      {
        element: ".tour-step.tour-step-seventeen",
        placement: "bottom",
        title: "Sampling from Network",
        content: "Click 'Download' button to download the sample data in '.csv' format.",
        onShow: function(tour) {
          d3.select("#sampleDownloadBtn")
            .classed("tour-step tour-step-seventeen", true);
        },                      
      },
      // {
      //   element: ".tour-step.tour-step-eighteen",
      //   placement: "bottom",
      //   title: "Downloading Network",
      //   content: "Click 'Download Network' button to save the network for future use.",
      //   // reflex: true,        
      //   // onShown: function(tour) {
      //   //   $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
      //   // },              
      // },
      // {
      //   element: ".tour-step.tour-step-dropdown",
      //   placement: "bottom",
      //   backdrop:true ,
      //   title: "Sampling",
      //   content: "Click the dropdown menu and select 'Sample from Network' to start sampling."
      // },      
      {
        element: ".tour-step.tour-step-nineteen-one",
        placement: "bottom",
        backdrop:true ,
        title: "Toy Dataset",
        content: "Click the dropdown menu and select 'Use Toy Dataset'."
      },
      {
        element: ".tour-step.tour-step-nineteen-two",
        placement: "left",
        title: "Toy Dataset",
        content: "Select the 'Rain' dataset from the list.",
        onShow: function(tour) {
          d3.select("#example-dataset")
            .classed("tour-step tour-step-nineteen-two", true);
        },         
      },
      {
        element: ".tour-step.tour-step-learning-one",
        placement: "bottom",
        backdrop:true,
        title: "Learning Structure",
        content: "Click the dropdown menu and select 'Learn Structure'."
      },
      {
        element: ".tour-step.tour-step-structure-learnt",
        placement: "right",
        title: "Structure",
        content: "The structure has been learnt."
      },      
      {
        element: ".tour-step.tour-step-learning-two",
        placement: "bottom",
        backdrop:true ,
        title: "Learning Parameters",
        content: "Click the dropdown menu and select 'Learn Parameters'."
      },
      {
        element: ".tour-step.tour-step-params-learnt",
        placement: "top",
        title: "Learning Parameters",
        content: "Click on the 'Rain' node to select it.",
        reflex:true,
        onShow: function(tour) {
          var selection = d3.selectAll("g.node");
          selection.filter(function(d, i) {return d.title === "Rain"})
                   .classed("tour-step tour-step-params-learnt", true);
        },
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },                                 
      },
      {
        element: ".tour-step.tour-step-updated-cpt",
        placement: "left",
        title: "Learning Parameters",
        content: "Notice that the CPT has been updated.",
        onShow: function(tour) {
          d3.select(".cpt-table.table-bayes")
          .classed("tour-step tour-step-updated-cpt", true);
        },                                
      },
      {
        element: ".tour-step.tour-step-twenty",
        placement: "bottom",
        orphan: true,
        backdrop: true,
        title: "Thank you.",
        content: "Have fun exploring the other features of the tool.",
      },                    
    ]);
 
    // Initialize the tour
    tour.init();
 
    // Start the tour
    tour.start();
 
};

d3.select("#tutorial")
  .on("click", function() {
    // loadDefaultNetwork();
    startTour();
  });