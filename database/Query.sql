use mydb;
insert into scene  values('1','forest','22.4189192','114.21211519999997','D:\\pano\forest.jpg');
insert into scene value('2','temple','22.4147983','114.21031450000007','D:\\pano\temple.jpg');
select * from scene;
insert into direction values('1','5km','1','2');
select * from direction;
delete  from scene where id='1';
