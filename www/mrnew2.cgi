#!/usr/bin/perl

use strict;
use MogileFS::Client;
use DBI;
use CGI ':standard';

do '/etc/polony-tools/config.pl';

my $q = new CGI;
print $q->header;

my $Qrevision = escapeHTML($q->param('revision'));
my $Qmrfunction = escapeHTML($q->param('mrfunction'));
print qq{
<html>
<head>
<title>mapreduce jobs / new</title>
</head>
<body>
<h2><a href="mrindex.cgi">mapreduce jobs</a> / new (2)</h2>

<form method=get action="mrnew3.cgi">
<input type=hidden name=revision value="$Qrevision">
Revision: $Qrevision<br>
<input type=hidden name=mrfunction value="$Qmrfunction">
Map/reduce function: $Qmrfunction<br>
Dataset:<br>
};

my $dbh = DBI->connect($main::analysis_dsn,
		       $main::analysis_mysql_username,
		       $main::analysis_mysql_password) or die DBI->errstr;

my $sth = $dbh->prepare("
    select dsid, nframes, ncycles
    from dataset");
$sth->execute or die $dbh->errstr;

print q{<select name=dsid size=16>};

while (my @row = $sth->fetchrow)
{
  print "<option value=\"".escapeHTML($row[0])."\">";
  print escapeHTML("$row[0] - $row[1] frames, $row[2] cycles");
  print "</option>\n";
}
print q{
</select>
<br>
<input type=submit value="Next">
</form>
</table>
</body>
</html>
};
