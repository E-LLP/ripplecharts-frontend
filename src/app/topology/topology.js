angular.module( 'ripplecharts.topology', [
  'ui.state',
  'ui.bootstrap'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'topology', {
    url: '/topology',
    views: {
      "main": {
        controller: 'TopologyCtrl',
        templateUrl: 'topology/topology.tpl.html'
      }
    },
    data:{ pageTitle: 'Rippled Topology Network' },
    resolve : {
      gateInit : function (gateways) {
        return gateways.promise;
      }
    }
  });
})

.controller('TopologyCtrl', function TopologyCtrl($scope, $http, gateways) {
  $scope.loading = true;
  $scope.status = "Loading...";

  var t = new Topology($http);

  function fetchAndShowTable(loadGraph) {
    t.fetch().then(function(data) {
      $scope.loading = false;
      $scope.status = '';

      if(data.node_count > 0) {
        data.nodes = t.formatUptimes(data.nodes);
        data.nodes = t.sortByUptime(data.nodes);
        data.nodes.forEach(function(node) {
          node.version_color = t.versionToColor(node.version);
        });
        var sp = t.mergeOldAndNew(data.nodes, $scope.nodes);
        $scope.nodes = sp;
        $scope.$apply();
        t.animateChange(['inbound_connections', 'outbound_connections', 'uptime_formatted']);

        if (loadGraph) {
          t.produce(data, {
            element: ".topology-graph",
            width: 1000,
            height: 500
          });
        } else {
          t.update(data);
        }

      } else {
        console.log('no nodes');
      }

    }).catch(function(e) {
      console.log(e);
      $scope.loading = false;
      $scope.status = e.toString();
    });
  }
  fetchAndShowTable(true);

  // update table every 30 seconds
  var interval = setInterval(function() {
    fetchAndShowTable();
  }, 30000);

  // stop the listeners when leaving page
  $scope.$on('$destroy', function(){
    clearInterval(interval);
  });
});

