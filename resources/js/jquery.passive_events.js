// --------------------------------------------------------------------------
// Passive event listeners
// --------------------------------------------------------------------------

jQuery.event.special.touchstart = {
	setup: function(_, ns, handle) {
		if ((ns.indexOf('noPreventDefault') > -1))
		{
			this.addEventListener("touchstart", handle, {
				passive: false
			});
		}
		else
		{
			this.addEventListener("touchstart", handle, {
				passive: true
			});
		}
	}
};

jQuery.event.special.touchmove = {
	setup: function(_, ns, handle) {
		if ((ns.indexOf('noPreventDefault') > -1))
		{
			this.addEventListener("touchmove", handle, {
				passive: false
			});
		}
		else
		{
			this.addEventListener("touchmove", handle, {
				passive: true
			});
		}
	}
};