import cytoscape from 'cytoscape';

function graph_to_cyto(graph: any) {
  return graph.positions.map((pos: any) => ({
    group: 'nodes',
    data: { id: 'p' + pos.id, name: pos.name, image: pos.image }
  })).concat(
    graph.actions.map((act: any) => ({
      group: 'edges',
      data: { id: 'a' + act.id, name: act.name, source: 'p' + act.from, target: 'p' + act.to, video: act.video }
    })));
}

var cy = cytoscape({

  container: document.getElementById('cy'), // container to render in

  elements: fetch("media/graph.json").then(response => response.json()).then(graph_to_cyto),

  style: [ // the stylesheet for the graph
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'label': 'data(name)'
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(name)'
      }
    }
  ],

  layout: {
    name: 'breadthfirst',
  }

});

function update_sidebar(title: string, image?: string, video?: string) {
  document.getElementById('action-name')!.innerHTML = title;
  var image_elm = document.getElementById('action-img') as HTMLImageElement
  if (image) {
    image_elm.src = "media/images/" + image;
    image_elm.style.display = "block";
  } else {
    image_elm.src = "";
    image_elm.style.display = "none";
  }
  var video_elm = document.getElementById('action-video') as HTMLVideoElement;
  if (video) {
    video_elm.src = "media/videos/" + video;
    video_elm.style.display = "block";
    video_elm.play();
  } else {
    video_elm.src = "";
    video_elm.style.display = "none";
  }
}

cy.on('tap', 'node', function (evt) {
  var node = evt.target.data();
  update_sidebar(node.name, node.image, undefined);
});

cy.on('tap', 'edge', function (evt) {
  var edge = evt.target.data();
  update_sidebar(edge.name, undefined, edge.video);
});