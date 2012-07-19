/*
show multiple balances
ripple progress bar
only fetch ripple lines when you start. then use websocket
trading
new design
console

updated accepted transactions
time stamp in feed
flash balance when it changes
update ledger page in real time
tell them when they aren't connected by the websocket

much later:
	multiple accounts
*/

var ncc={};

ncc.currentView='#StartScreen';
ncc.masterKey='';
ncc.accountID='';
ncc.accounts=[];
ncc.balance=0;
ncc.admin=false;
ncc.dataStore=dataStoreOptions[ DATA_STORE ];
ncc.currencyOptions={
	"AUD" : "AUD-Australian Dollar",
	"BTC" : "BTC-Bitcoins",
	"EUR" : "EUR-Euro",
	"GBP" : "GBP-British Pound",
	"RUB" : "RUB-Russian Ruble",
	"USD" : "USD-US Dollar",
	"XAU" : "XAU-Ounces of Gold",
	"XAG" : "XAG-Ounces of Silver"
};

ncc.allCurrencyOptions={
	"AUD" : "AUD-Australian Dollar",
	"BTC" : "BTC-Bitcoins",
	"EUR" : "EUR-Euro",
	"GBP" : "GBP-British Pound",
	"RUB" : "RUB-Russian Ruble",
	"USD" : "USD-US Dollar",
	"XAU" : "XAU-Ounces of Gold",
	"XAG" : "XAG-Ounces of Silver",
	"XNS" : "XNS-Newcoin Stamps" 
};

ncc.serverDown = function()
{
	$('#error').text('No response from server. Please check if it is running.');
}

ncc.checkError = function(response)
{
	var ret=false;
	var errorStr='';
	if(response.error)
	{
		errorStr=response.error;
	}
	if(response.result.error_message)
	{
		ret=true;
		errorStr+=' '+response.result.error_message;
	}else if(response.result.error)
	{
		ret=true;
		errorStr+=' '+response.result.error;
	}
	
	
	$('#error').text(errorStr);
	return ret;
}

ncc.error=function(str)
{
	$('#error').text(str);
}

ncc.displayScreen =function(screenName)
{
	$(ncc.currentView).hide();
	ncc.currentView='#'+screenName;
	$(ncc.currentView).show();
	
	if(ncc.currentView=='#HomeScreen') $("#NCCNav").show();
	else if(ncc.currentView=='#WelcomeScreen') rpc.wallet_propose(ncc.walletProposeResponse);
	else $("#NCCNav").hide();
}

ncc.walletProposeResponse=function(response,success)
{
	if(success)
	{
		ncc.checkError(response);
		if(response.result)
		{
			ncc.masterKey=response.result.master_seed;
			ncc.accountID=response.result.account_id;
			
			$('#NewMasterKey').text(ncc.masterKey);
			$('#NewAddress').text(ncc.accountID);
			
			$("#MasterKey").val(ncc.masterKey);
		}
		
	}else ncc.serverDown();
}




ncc.processAccounts = function(accounts)
{
	ncc.accounts=accounts;
	
	// figure total balance
	ncc.balance=0;
	ncc.accountID='';
	for(var i = 0; i < accounts.length; i++) 
	{
    	ncc.balance += accounts[i].Balance;
    	ncc.accountID= accounts[i].Account;
    	server.accountSubscribe(accounts[i].Account);
    	rpc.account_tx(accounts[i].Account,history.onHistoryResponse);
    }
    
    $('#Balance').text(ncc.displayAmount(ncc.balance));
    $('#RecvAddress').text(ncc.accountID);
    
}

ncc.displayAmount= function(str)
{
	str=str/BALANCE_DISPLAY_DIVISOR;
	return(ncc.addCommas(str));
}

ncc.addCommas= function(nStr) 
{
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}


	

///////////////////////////

ncc.infoTabShown = function()
{
	rpc.server_info(ncc.infoResponse);
	
}

									
ncc.infoResponse  = function(response,success)
{
	if(success)
	{
		ncc.checkError(response);
		
		if(response.result.info)
		{
			$('#InfoServerState').text( response.result.info.serverState );
			$('#InfoPublicKey').text( response.result.info.validationPKey );
		}
		
	}else ncc.serverDown();
}			



ncc.logout = function()
{
	rpc.data_delete('MasterKey');
	ncc.displayScreen("LoginScreen");
	$('#Balance').text('');
    $('#RecvAddress').text('');
}
//////////
ncc.addPeer = function()
{
	ip=$.trim( $("#NewPeerIP").val());
	port=$.trim( $("#NewPeerPort").val());
	rpc.connect(ip,port);
}




ncc.peersResponse = function(response,success)
{
	if(success)
	{
		ncc.checkError(response);
		
		//$('#status').text(JSON.stringify(response));
		if(response.result.peers)
		{
			$('#PeerTable').empty();
			var peers=response.result.peers;
			for(var i=0; i<peers.length; i++)
			{
				$('#PeerTable').append('<tr><td>'+i+'</td><td>'+peers[i].ip+'</td><td>'+peers[i].port+'</td><td>'+peers[i].version+'</td></tr>');  // #PeerTable is actually the tbody element so this append works
			}
		}
			
	}else ncc.serverDown();
}






///////////

ncc.chageTabs = function(e)
{
	e.target.onTabShown();
}

ncc.nop = function() {}



$(document).ready(function(){
	
	$(".screen").hide();
	$("#NCCNav").hide();
	
	$('#tabSend a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	});
	
	$('#tabHistory a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	});
	

	$('#tabLedger a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	});
	
	
	$('#tabUNL a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	});
	
	$('#tabPeers a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	});
	
	$('#tabLedger a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	});
	
	var tab;  
	tab = document.getElementById( "SendTabButton");
	tab.onTabShown = send.onShowTab;
	
	tab = document.getElementById( "RippleTabButton");
	tab.onTabShown = ripple.onShowTab;
	
	tab=document.getElementById( "LedgerTabButton");
	tab.onTabShown = function(){ rpc.ledger(ledgerScreen.ledgerResponse); };
	
	tab = document.getElementById( "HistoryTabButton");
	tab.onTabShown = history.onShowTab;
	
	tab = document.getElementById( "UNLTabButton");
	tab.onTabShown = function(){ rpc.unl_list(unlScreen.unlResponse); };
	  
	tab = document.getElementById( "PeersTabButton");
	tab.onTabShown = function(){ rpc.peers(ncc.peersResponse); };
	
	tab = document.getElementById( "InfoTabButton");
	tab.onTabShown = ncc.infoTabShown;  
	
	tab = document.getElementById( "FeedTabButton");
	tab.onTabShown = feed.onShowTab;  
	
	tab = document.getElementById( "TradeTabButton");
	tab.onTabShown = trade.onShowTab;  
	
	
	$('a[data-toggle="tab"]').on('show', ncc.chageTabs);
	
	startUp.start();
	
});
