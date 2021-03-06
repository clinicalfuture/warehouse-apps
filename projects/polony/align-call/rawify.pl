#!/usr/bin/perl

use strict; 
use Fcntl ':flock';
use MogileFS::Client;

my $localfs = 1;
my $fetchprogram;
my ($stem) = @ARGV;

my $attempts = 0;
if ($stem =~ s/^mogilefs:\/\///)
{
MOG:
    ++$attempts;
    eval {
	$main::mogc = MogileFS::Client->new
	    (domain => $ENV{MOGILEFS_DOMAIN},
	     hosts => [split(",", $ENV{MOGILEFS_TRACKERS})]);
    };
    if ($@)
    {
	if ($attempts <= 5)
	{
	    sleep ($attempts);
	    redo MOG;
	}
	else
	{
	    die "Giving up initializing MogileFS after $attempts attempts: $@";
	}
    }
    my $mogc = $main::mogc;
    my $filter = "";
    my @urls = $mogc->get_paths ("$stem.raw");
    if (!@urls) {
	@urls = $mogc->get_paths ("$stem.tif");
	$filter = "| convert tif:- -endian lsb gray:-";
    }
    if (!@urls) {
	@urls = $mogc->get_paths ("$stem.tif.gz");
	$filter = "| zcat | convert tif:- -endian lsb gray:-";
    }
    if (!@urls) {
	die "No raw/tif/tif.gz found for $stem";
    }
    for (1..5)
    {
	exit 0 if 0 == system ("wget -q -O - $urls[0] $filter");

	# seg fault
	next if (($? >> 8) != 0 && ($? & 127) == 11);

	# any other error
	sleep ($_ - 1) if $_ > 1;

	push (@urls, shift @urls);
    }
    die "Giving up fetching @urls for $stem";
}
elsif ($stem =~ /:\/\//)
{
    $fetchprogram = "wget -q -O -";
    $localfs = 0;
}
else
{
    open (LOCKFILE, ">>imagelockfile") or die "imagelockfile: $!";
    flock (LOCKFILE, LOCK_EX);
    $fetchprogram = "cat";
}

for (1..4)
{
    if (!$localfs || (-e "$stem.raw"))
    {
	last if 0 == system ("$fetchprogram '$stem.raw'");
    }
    if (!$localfs || (-e "$stem.tif"))
    {
	last if 0 == system ("$fetchprogram '$stem.tif' | convert tif:- -endian lsb gray:-");
	if (($? >> 8) != 0 && ($? & 127) == 11)
	{
	    next;
	}
    }
    if (!$localfs || (-e "$stem.tif.gz"))
    {
	last if 0 == system ("$fetchprogram '$stem.tif.gz' | zcat | convert tif:- -endian lsb gray:-");
	if (($? >> 8) != 0 && ($? & 127) == 11)
	{
	    next;
	}
    }
    print STDERR "No raw/tif/tif.gz, skipping $stem\n";
    last;
}

# arch-tag: Tom Clegg Fri Mar 16 20:45:35 PDT 2007 (align-read/rawify.sh)
